import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/vue';

import VideoControls from '@/components/editor/VideoControls.vue';

afterEach(() => {
  cleanup();
});

describe('VideoControls', () => {
  it('Should render time display correctly', () => {
    const props = {
      videoLength: 12.5,
      playbackRate: 2.0,
      sliderTime: 6.4,
    };

    const { getByTestId } = render(VideoControls, {
      props,
    });

    const timeDisplay = getByTestId('time-display');

    expect(timeDisplay.textContent).toBe(
      `${(props.sliderTime / props.playbackRate).toFixed(1)} / ${(props.videoLength / props.playbackRate).toFixed(1)}`,
    );
  });

  it('Should emit "play" event when play button is clicked', async () => {
    const props = {
      videoLength: 12.5,
      playbackRate: 2.0,
      sliderTime: 6.4,
    };

    const { getByTestId, emitted } = render(VideoControls, {
      props,
    });

    const playButton = getByTestId('play-button');

    await playButton.click();

    expect(emitted()).toHaveProperty('play');
  });

  it('Should emit "pause" event when pause button is clicked', async () => {
    const props = {
      videoLength: 12.5,
      playbackRate: 2.0,
      sliderTime: 6.4,
    };

    const { getByTestId, emitted } = render(VideoControls, {
      props,
    });

    const playButton = getByTestId('pause-button');

    await playButton.click();

    expect(emitted()).toHaveProperty('pause');
  });

  it('Should update playback rate when input changes', async () => {
    const props = {
      videoLength: 12.5,
      playbackRate: 2.0,
      sliderTime: 6.4,
    };

    const { getByTestId, emitted } = render(VideoControls, {
      props,
    });

    const playbackRateInput = getByTestId('playback-rate');

    fireEvent.update(playbackRateInput, '1.5');
    expect((playbackRateInput as HTMLInputElement).value).toBe('1.5');

    expect(emitted()).toHaveProperty('update-playback-rate');
    expect(emitted()['update-playback-rate'][0]).toEqual([1.5]);
  });

  it('Should update slider time when input changes', async () => {
    const props = {
      videoLength: 12.5,
      playbackRate: 2.0,
      sliderTime: 6.4,
    };

    const { getByTestId, emitted } = render(VideoControls, {
      props,
    });

    const timeSlider = getByTestId('time-slider');

    fireEvent.update(timeSlider, '8.0');
    expect((timeSlider as HTMLInputElement).value).toBe('8.0');

    expect(emitted()).toHaveProperty('go-to');
    expect(emitted()['go-to'][0]).toEqual(['8.0']);
  });

  it('Should update local playback rate when prop changes', async () => {
    const props = {
      videoLength: 12.5,
      playbackRate: 2.0,
      sliderTime: 6.4,
    };

    const { getByTestId, rerender } = render(VideoControls, {
      props,
    });

    const playbackRateInput = getByTestId('playback-rate');
    expect((playbackRateInput as HTMLInputElement).value).toBe('2');

    await rerender({ ...props, playbackRate: 3.5 });
    expect((playbackRateInput as HTMLInputElement).value).toBe('3.5');
  });

  it('Should update local slider time when prop changes', async () => {
    const props = {
      videoLength: 12.5,
      playbackRate: 2.0,
      sliderTime: 6.4,
    };

    const { getByTestId, rerender } = render(VideoControls, {
      props,
    });

    const timeSlider = getByTestId('time-slider');
    expect((timeSlider as HTMLInputElement).value).toBe('6.4');

    await rerender({ ...props, sliderTime: 9.2 });
    expect((timeSlider as HTMLInputElement).value).toBe('9.2');
  });
});
