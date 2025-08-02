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
    const { getByTestId, getAllByTestId } = render(TimelineEditor, {
      props: {
        currentTime: 5.0,
        videoLength: 10.0,
      },
    });

    const cutButton = getByTestId('cut-button');

    await cutButton.click();

    const cuts = getAllByTestId('cut');

    expect(cuts.length).toBe(1);

    const videoParts = getAllByTestId('video-part');

    expect(videoParts.length).toBe(2);
  });

  it('Should show cuts only on hover', async () => {
    const { getByTestId } = render(TimelineEditor, {
      props: {
        currentTime: 5.0,
        videoLength: 10.0,
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
    const { getByTestId, queryAllByTestId, getAllByTestId } = render(TimelineEditor, {
      props: {
        currentTime: 5.0,
        videoLength: 10.0,
      },
    });

    const cutButton = getByTestId('cut-button');
    await cutButton.click();

    const cut = getByTestId('cut');
    await cut.click();

    const cuts = queryAllByTestId('cut');
    expect(cuts.length).toBe(0);

    const videoParts = getAllByTestId('video-part');
    expect(videoParts.length).toBe(1);
  });

  it('Should not allow two cuts at the same timestamp', async () => {
    const { getByTestId, getAllByTestId } = render(TimelineEditor, {
      props: {
        currentTime: 5.0,
        videoLength: 10.0,
      },
    });

    const cutButton = getByTestId('cut-button');

    await cutButton.click();
    await cutButton.click();

    const cuts = getAllByTestId('cut');
    expect(cuts.length).toBe(1);

    const videoParts = getAllByTestId('video-part');
    expect(videoParts.length).toBe(2);
  });

  it('Should be able to select and deselect parts', async () => {
    const { getByTestId, getAllByTestId } = render(TimelineEditor, {
      props: {
        currentTime: 5.0,
        videoLength: 10.0,
      },
    });

    const cutButton = getByTestId('cut-button');

    await cutButton.click();

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
    };

    const { getByTestId, getAllByTestId, emitted } = render(TimelineEditor, {
      props,
    });

    const cutButton = getByTestId('cut-button');
    await cutButton.click();

    const videoParts = getAllByTestId('video-part');
    await videoParts[1].click();

    const deleteButton = getByTestId('remove-button');
    await deleteButton.click();

    expect(emitted()).toHaveProperty('update:removedParts');
    expect(emitted()['update:removedParts'][0]).toEqual([[[5, 10]]]);

    const returnButton = getByTestId('return-button');
    await videoParts[1].click();
    returnButton.click();
  });
});
