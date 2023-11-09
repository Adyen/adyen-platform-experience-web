import { useEffect, useRef } from 'preact/compat';
import { StoryContext } from '@storybook/types';
import { PreactRenderer } from '@storybook/preact';
import { getStoryContextAdyenFP } from './get-story-context';
import { enableServerInMockedMode, stopMockedServer } from '../../endpoints/mock-server/utils';

interface IContainer<T extends new (...args: any) => any> {
    component: T;
    componentConfiguration: any;
    context: StoryContext<PreactRenderer, any>;
    mockedApi?: boolean;
}

export const Container = <T extends new (...args: any) => any>({ component, componentConfiguration, context, mockedApi }: IContainer<T>) => {
    const container = useRef(null);
    const adyenFP = getStoryContextAdyenFP(context);
    const Component = new component({ core: adyenFP, ...componentConfiguration });

    useEffect(() => {
        if (mockedApi) void enableServerInMockedMode();

        if (!adyenFP) {
            return;
        }
        Component.mount(container.current ?? '');

        return () => {
            if (mockedApi) stopMockedServer();
        };
    }, []);

    return <div ref={container} id="component-root" className="component-wrapper" />;
};
