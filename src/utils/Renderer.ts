export const renderer = {
  exportProject: async (
    videoSrc: string,
    removedParts: [number, number][],
    videoSpeed: number,
    aspectRatio: number,
    options = { fps: 24 },
  ) => {
    try {
      // Fetch and load video
      const response = await fetch(videoSrc);
      const videoBlob = await response.blob();
      const video = document.createElement('video');

      // Create a promise to ensure video metadata is loaded
      const videoLoaded = new Promise((resolve) => {
        video.onloadedmetadata = () => resolve(true);
      });

      video.src = URL.createObjectURL(videoBlob);
      await videoLoaded;

      // Determine FPS based on hardware capability or user preference
      const fps = options.fps || 24;

      const duration = video.duration * 1000;
      const sortedRemovedParts = removedParts
        .map(([start, end]) => [start * 1000, end * 1000] as [number, number])
        .sort((a, b) => a[0] - b[0]);

      // Create canvas with appropriate dimensions
      const canvas = document.createElement('canvas');

      // Sort out aspect ratio for final result
      const originalAspect = video.videoWidth / video.videoHeight;
      if (aspectRatio > originalAspect) {
        canvas.width = video.videoHeight * aspectRatio;
        canvas.height = video.videoHeight;
      } else {
        canvas.width = video.videoWidth;
        canvas.height = video.videoWidth / aspectRatio;
      }
      const ctx = canvas.getContext('2d', { alpha: false })!; // optimize context

      // Configure recorder with quality options
      const pixelCount = video.videoWidth * video.videoHeight;
      const stream = canvas.captureStream(fps);
      const recorderOptions = {
        mimeType: 'video/webm',
        videoBitsPerSecond: Math.min(2500000, pixelCount * 0.2),
      };
      const recorder = new MediaRecorder(stream, recorderOptions);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const outputBlob = new Blob(chunks, { type: 'video/webm' });
        const downloadUrl = URL.createObjectURL(outputBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'edited-video.webm';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
        // Clean up memory
        URL.revokeObjectURL(video.src);
      };

      recorder.start();

      // Process video frames in batches
      const frameDuration = 1000 / fps;
      const batchSize = 5; // Process frames in small batches
      let currentTime = 0;

      // Calculate total frames for progress tracking
      const totalFrames = Math.ceil(duration / (frameDuration * videoSpeed));
      let processedFrames = 0;

      // Event to notify progress
      const progressEvent = new CustomEvent('export-progress', {
        detail: { progress: 0, total: totalFrames },
      });

      while (currentTime < duration) {
        // Process a batch of frames
        for (let i = 0; i < batchSize && currentTime < duration; i++) {
          let skipFrame = false;
          for (const [start, end] of sortedRemovedParts) {
            if (currentTime >= start && currentTime <= end) {
              skipFrame = true;
              break;
            }
          }

          if (!skipFrame) {
            video.currentTime = currentTime / 1000;
            // Use a timeout-based approach instead of onseeked for better performance
            await new Promise((resolve) => {
              const checkReady = () => {
                if (video.readyState >= 3) {
                  // HAVE_FUTURE_DATA or better
                  resolve(true);
                } else {
                  setTimeout(checkReady, 10);
                }
              };
              checkReady();
            });

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          }

          // Adjust time based on speed
          currentTime += frameDuration * videoSpeed;
          processedFrames++;
        }

        // Update progress
        progressEvent.detail.progress = processedFrames;
        window.dispatchEvent(progressEvent);

        // Allow UI to update between batches
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      recorder.stop();
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  },
};
