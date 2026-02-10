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
      video.src = URL.createObjectURL(videoBlob);
      await new Promise((resolve) => {
        video.onloadedmetadata = () => resolve(true);
      });

      const fps = options.fps;
      const duration = video.duration * 1000;
      const sortedRemovedParts = removedParts
        .map(([start, end]) => [start * 1000, end * 1000] as [number, number])
        .sort((a, b) => a[0] - b[0]);

      // Create canvas with correct dimensions and aspect ratio
      const canvas = document.createElement('canvas');
      const originalAspect = video.videoWidth / video.videoHeight;
      if (aspectRatio > originalAspect) {
        canvas.width = video.videoHeight * aspectRatio;
        canvas.height = video.videoHeight;
      } else {
        canvas.width = video.videoWidth;
        canvas.height = video.videoWidth / aspectRatio;
      }

      const ctx = canvas.getContext('2d', { alpha: false })!;

      // Configure recorder
      const stream = canvas.captureStream(fps);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
        videoBitsPerSecond: Math.min(2500000, video.videoWidth * video.videoHeight * 0.2),
      });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const outputBlob = new Blob(chunks, { type: 'video/webm' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(outputBlob);
        link.download = 'edited-video.webm';
        link.click();
        URL.revokeObjectURL(link.href);
        URL.revokeObjectURL(video.src);
      };

      recorder.start();

      // Process video frames in batches
      const frameDuration = 1000 / fps;
      const batchSize = 5;
      let currentTime = 0;

      while (currentTime < duration) {
        for (let i = 0; i < batchSize && currentTime < duration; i++) {
          const skipFrame = sortedRemovedParts.some(
            ([start, end]) => currentTime >= start && currentTime <= end,
          );

          if (!skipFrame) {
            video.currentTime = currentTime / 1000;
            await new Promise((resolve) => {
              const checkReady = () => {
                if (video.readyState >= 3) {
                  resolve(true);
                } else {
                  setTimeout(checkReady, 10);
                }
              };
              checkReady();
            });
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          }

          currentTime += frameDuration * videoSpeed;
        }

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
