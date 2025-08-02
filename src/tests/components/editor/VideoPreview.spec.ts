import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/vue';

import VideoPreview from '@/components/editor/VideoPreview.vue';

afterEach(() => {
  cleanup();
});

describe('VideoPreview', () => {
  it('Should render upload field if src is not provided', () => {
    const { getByTestId } = render(VideoPreview, {
      props: {
        src: '',
      },
    });

    const videoUpload = getByTestId('video-upload');
    expect(videoUpload).toBeDefined();
  });

  it('Should render video if src is provided', () => {
    const { getByTestId } = render(VideoPreview, {
      props: {
        src: 'test',
      },
    });

    const videoUpload = getByTestId('video');
    expect(videoUpload).toBeDefined();
  });
});
