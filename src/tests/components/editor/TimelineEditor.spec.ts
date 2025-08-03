import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/vue';

import TimelineEditor from '@/components/editor/TimelineEditor.vue';

afterEach(() => {
  cleanup();
});

describe('TimelineEditor', () => {
  it('Should remove video when eject button is clicked', async () => {
    const { getByTestId, emitted } = render(TimelineEditor, {
      props: {
        currentTime: 5.0,
        videoLength: 10.0,
      },
    });

    const ejectButton = getByTestId('eject-button');

    await ejectButton.click();

    expect(emitted()).toHaveProperty('changeVideo');
  });

  it('Should export video when export button is clicked', async () => {
    const { getByTestId, emitted } = render(TimelineEditor, {
      props: {
        currentTime: 5.0,
        videoLength: 10.0,
      },
    });

    const ejectButton = getByTestId('export-button');

    await ejectButton.click();

    expect(emitted()).toHaveProperty('exportVideo');
  });

  it('Should add cuts to video timeline', async () => {
    const { getByTestId, emitted } = render(TimelineEditor, {
      props: {
        currentTime: 5.0,
        videoLength: 10.0,
        parts: [[0, 10.0]],
      },
    });

    const cutButton = getByTestId('cut-button');

    await cutButton.click();

    expect(emitted()).toHaveProperty('update:parts');
    expect(emitted()['update:parts'][0]).toEqual([
      [
        [0, 5],
        [5, 10],
      ],
    ]);
  });

  it('Should show cuts only on hover', async () => {
    const { getByTestId } = render(TimelineEditor, {
      props: {
        currentTime: 5.0,
        videoLength: 10.0,
        parts: [
          [0, 5],
          [5, 10],
        ],
      },
    });

    const cutButton = getByTestId('cut-button');
    await cutButton.click();

    const cut = getByTestId('cut');

    expect(cut.className.includes('hovered')).toBe(false);

    await fireEvent.mouseOver(cut);
    expect(cut.className.includes('hovered')).toBe(true);

    await fireEvent.mouseLeave(cut);
    expect(cut.className.includes('hovered')).toBe(false);
  });

  it('Should remove cuts when cut is clicked', async () => {
    const { getByTestId, emitted } = render(TimelineEditor, {
      props: {
        currentTime: 5.0,
        videoLength: 10.0,
        parts: [
          [0, 5],
          [5, 10],
        ],
      },
    });

    const cut = getByTestId('cut');
    await cut.click();

    expect(emitted()).toHaveProperty('update:parts');
    expect(emitted()['update:parts'][0]).toEqual([[[0, 10]]]);
  });

  it('Should not allow two cuts at the same timestamp', async () => {
    const { getByTestId, emitted } = render(TimelineEditor, {
      props: {
        currentTime: 5.0,
        videoLength: 10.0,
        parts: [[0, 10.0]],
      },
    });

    const cutButton = getByTestId('cut-button');

    await cutButton.click();
    await cutButton.click();

    expect(emitted()['update:parts'].length).toBe(1);
  });

  it('Should be able to select and deselect parts', async () => {
    const { getAllByTestId } = render(TimelineEditor, {
      props: {
        currentTime: 5.0,
        videoLength: 10.0,
        parts: [
          [0, 5],
          [5, 10],
        ],
      },
    });

    const videoParts = getAllByTestId('video-part');

    await videoParts[1].click();
    expect(videoParts[1].className.includes('selected')).toBe(true);
    expect(videoParts[0].className.includes('selected')).toBe(false);

    await videoParts[1].click();
    expect(videoParts[1].className.includes('selected')).toBe(false);
    expect(videoParts[0].className.includes('selected')).toBe(false);
  });

  it('Should be able to remove parts', async () => {
    const props = {
      currentTime: 5.0,
      videoLength: 10.0,
      parts: [[0, 5] as [number, number], [5, 10] as [number, number]],
    };

    const { getByTestId, getAllByTestId, emitted } = render(TimelineEditor, {
      props,
    });

    const videoParts = getAllByTestId('video-part');
    await videoParts[1].click();

    const deleteButton = getByTestId('remove-button');
    await deleteButton.click();

    expect(emitted()).toHaveProperty('update:removedParts');
    expect(emitted()['update:removedParts'][0]).toEqual([[[5, 10]]]);
  });

  it('Should show which parts are removed', () => {
    const props = {
      currentTime: 5.0,
      videoLength: 10.0,
      parts: [[0, 5] as [number, number], [5, 10] as [number, number]],
      removedParts: [[5, 10] as [number, number]],
    };

    const { getAllByTestId } = render(TimelineEditor, {
      props,
    });

    const videoParts = getAllByTestId('video-part');

    expect(videoParts[1].className.includes('deleted')).toBe(true);
    expect(videoParts[0].className.includes('deleted')).toBe(false);
  });

  it('Should be able to return parts', async () => {
    const props = {
      currentTime: 5.0,
      videoLength: 10.0,
      parts: [[0, 5] as [number, number], [5, 10] as [number, number]],
      removedParts: [[5, 10] as [number, number]],
    };

    const { getByTestId, getAllByTestId, emitted } = render(TimelineEditor, {
      props,
    });

    const videoParts = getAllByTestId('video-part');
    await videoParts[1].click();

    const returnButton = getByTestId('return-button');
    await returnButton.click();

    expect(emitted()).toHaveProperty('update:removedParts');
    expect(emitted()['update:removedParts'][0]).toEqual([[]]);
  });
});
