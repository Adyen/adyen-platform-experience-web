import { ComponentMap, ComponentOptions } from '@adyen/adyen-fp-web';
import { useEffect, useRef } from 'preact/compat';
import { StoryContext } from '@storybook/types';
import { PreactRenderer } from '@storybook/preact';
import { getStoryContextAdyenFP } from './get-story-context';

interface IContainer<T extends keyof ComponentMap> {
    type: T;
    componentConfiguration: ComponentOptions<T>;
    context: StoryContext<PreactRenderer, any>;
}

export const Container = <T extends keyof ComponentMap>({ type, componentConfiguration, context }: IContainer<T>) => {
    const container = useRef(null);
    const adyenFP = getStoryContextAdyenFP(context);
    useEffect(() => {
        if (!adyenFP) {
            return;
        }
        adyenFP.create(type, componentConfiguration).mount(container.current ?? '');
    }, []);

    return <div ref={container} id="component-root" className="component-wrapper" />;
};
