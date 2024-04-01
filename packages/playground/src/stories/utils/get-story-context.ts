import { StoryContext } from '@storybook/types';
import { Core, CoreOptions } from '@adyen/adyen-platform-experience-web';
import { PreactRenderer } from '@storybook/preact';

export const getStoryContextAdyenPlatformExperience = (context: StoryContext<PreactRenderer, CoreOptions>): Core | undefined => {
    const { AdyenPlatformExperience } = context.loaded;
    return AdyenPlatformExperience;
};
