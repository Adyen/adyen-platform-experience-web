import { useEffect, useRef } from 'preact/compat';
import { StoryContext } from '@storybook/types';
import { PreactRenderer } from '@storybook/preact';
import { getStoryContextAdyenPlatformExperience } from './get-story-context';
import { stopMockedServer } from '../../mocks/mock-server/utils';
import { SetupWorker } from 'msw/browser';

interface IContainer<T extends new (...args: any) => any> {
    component: T;
    componentConfiguration: Omit<ConstructorParameters<T>[0], 'core'>;
    context: StoryContext<PreactRenderer, any>;
    mockedApi?: boolean;
    worker: SetupWorker | undefined;
}

export const Container = <T extends new (args: any) => any>({ component, componentConfiguration, context, mockedApi, worker }: IContainer<T>) => {
    const container = useRef(null);
    const AdyenPlatformExperience = getStoryContextAdyenPlatformExperience(context);
    const Component = new component({ ...componentConfiguration, core: AdyenPlatformExperience });

    useEffect(() => {
        if (!AdyenPlatformExperience) {
            return;
        }

        Component.mount(container.current ?? '');

        return () => {
            if (mockedApi && worker) worker?.stop();
        };
    }, []);

    return <div ref={container} id="component-root" className="component-wrapper" />;
};
