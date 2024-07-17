import { useEffect, useRef } from 'preact/compat';
import { StoryContext } from '@storybook/types';
import { PreactRenderer } from '@storybook/preact';
import { getStoryContextAdyenPlatformExperience } from './get-story-context';
import { stopMockedServer } from '../../playground/mock-server/utils';

interface IContainer<T extends new (...args: any) => any> {
    component: T;
    componentConfiguration: Omit<ConstructorParameters<T>[0], 'core'>;
    context: StoryContext<PreactRenderer, any>;
    mockedApi?: boolean;
}

export const Container = <T extends new (args: any) => any>({ component, componentConfiguration, context, mockedApi }: IContainer<T>) => {
    const container = useRef(null);
    const AdyenPlatformExperience = getStoryContextAdyenPlatformExperience(context);
    const Component = new component({ ...componentConfiguration, core: AdyenPlatformExperience });

    useEffect(() => {
        if (!AdyenPlatformExperience) {
            return;
        }

        Component.mount(container.current ?? '');

        return () => {
            if (mockedApi) stopMockedServer();
        };
    }, []);

    return <div ref={container} id="component-root" className="component-wrapper" />;
};
