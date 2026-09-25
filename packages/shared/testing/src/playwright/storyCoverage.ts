import { test } from '@playwright/test';

export const STORY_ANNOTATION = 'story';

/** Tags the running test with the story it opened, so the story coverage reporter can attribute it. */
export const recordStoryVisit = (storyId: string) => {
    const { annotations } = test.info();
    if (annotations.some(({ type, description }) => type === STORY_ANNOTATION && description === storyId)) return;
    annotations.push({ type: STORY_ANNOTATION, description: storyId });
};
