export const renderer = {
  exportProject: async (
    videoSrc: string,
    removedParts: [number, number][],
    videoSpeed: number,
    options = { fps: 24, qualityPreset: 'medium' },
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { alpha: false })!; // optimize context

      // Configure recorder with quality options
      const stream = canvas.captureStream(fps);
      const recorderOptions = {
        mimeType: 'video/webm',
        videoBitsPerSecond: getVideoBitrate(
          options.qualityPreset,
          video.videoWidth,
          video.videoHeight,
        ),
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

// Helper function to determine appropriate bitrate based on resolution and quality preset
function getVideoBitrate(preset = 'medium', width: number, height: number): number {
  const pixelCount = width * height;

  switch (preset) {
    case 'low':
      return Math.min(1000000, pixelCount * 0.1);
    case 'high':
      return Math.min(8000000, pixelCount * 0.4);
    case 'medium':
    default:
      return Math.min(2500000, pixelCount * 0.2);
  }
}
