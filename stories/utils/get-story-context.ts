import { StoryContext } from '@storybook/types';
import { PreactRenderer } from '@storybook/preact';
import { Core, CoreOptions } from '../../src';

export const getStoryContextAdyenPlatformExperience = (context: StoryContext<PreactRenderer, CoreOptions<any>>): Core<any> | undefined => {
    const { AdyenPlatformExperience } = context.loaded;
    return AdyenPlatformExperience;
};
