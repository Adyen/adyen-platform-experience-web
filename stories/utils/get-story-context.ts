import { StoryContext } from '@storybook/types';
import { PreactRenderer } from '@storybook/preact';
import { Core, CoreOptions } from '../../src';
import { SetupWorker } from 'msw/browser';

export const getStoryContextAdyenPlatformExperience = (
    context: StoryContext<PreactRenderer, CoreOptions<any>>
): { AdyenPlatformExperience: Core<any> | undefined; worker: SetupWorker } => {
    const { AdyenPlatformExperience, worker } = context.loaded;
    return { AdyenPlatformExperience, worker };
};
