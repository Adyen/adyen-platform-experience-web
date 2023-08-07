import Core from '@adyen/adyen-fp-web/src/core';
import { StoryContext } from '@storybook/types';
import { CoreOptions } from '@adyen/adyen-fp-web/src/core/types';
import { PreactRenderer } from '@storybook/preact';

export const getStoryContextAdyenFP = (context: StoryContext<PreactRenderer, CoreOptions>): Core | undefined => {
    const { adyenFP } = context.loaded;
    return adyenFP;
};
