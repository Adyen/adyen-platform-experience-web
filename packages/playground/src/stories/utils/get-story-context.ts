import { StoryContext } from '@storybook/types';
import { Core, CoreOptions } from '@adyen/adyen-fp-web';
import { PreactRenderer } from '@storybook/preact';

export const getStoryContextAdyenFP = (context: StoryContext<PreactRenderer, CoreOptions>): Core | undefined => {
    const { adyenFP } = context.loaded;
    return adyenFP;
};
