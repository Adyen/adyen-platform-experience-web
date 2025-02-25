import { PreactRenderer } from '@storybook/preact';
import { DecoratorFunction } from '@storybook/csf';

let getLatestArgs = () => ({});

export const ParameterAwareMockedStory: DecoratorFunction<PreactRenderer> = (Story, { args, parameters }) => {
    getLatestArgs = () => args;
    for (let i = 0; i < parameters.msw.handlers.length; i++) {
        const handler = parameters.msw.handlers[i];

        const originalResolver = handler.resolver;
        parameters.msw.handlers[i].resolver = (r: any) => {
            return originalResolver.call(this, r, getLatestArgs());
        };
    }

    return Story();
};
