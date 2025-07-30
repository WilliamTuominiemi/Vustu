export const renderer = {
  exportProject: async (videoSrc: string, removedParts: [number, number][], videoSpeed: number) => {
    try {
      // Fetch and load video
      const response = await fetch(videoSrc);
      const videoBlob = await response.blob();
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoBlob);
      await video.play();
      video.pause();

      const duration = video.duration * 1000;
      const sortedRemovedParts = removedParts
        .map(([start, end]) => [start * 1000, end * 1000] as [number, number])
        .sort((a, b) => a[0] - b[0]);

      // Create canvas to draw video frames
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      const stream = canvas.captureStream(30); // 30fps
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
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
      };

      recorder.start();

      // Process video frames
      let currentTime = 0;
      const frameDuration = 1000 / 24; // 24fps
      while (currentTime < duration) {
        let skipFrame = false;
        for (const [start, end] of sortedRemovedParts) {
          if (currentTime >= start && currentTime <= end) {
            skipFrame = true;
            break;
          }
        }

        if (!skipFrame) {
          video.currentTime = currentTime / 1000;
          await new Promise((resolve) => (video.onseeked = resolve));
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        // videoSpeed adjusts the playback rate
        currentTime += frameDuration * videoSpeed;
      }

      recorder.stop();
    } catch (error) {
      throw error;
    }
  },
};
