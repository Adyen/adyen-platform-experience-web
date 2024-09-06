import { useEffect, useRef } from 'preact/compat';
import { StoryContext } from '@storybook/types';
import { PreactRenderer } from '@storybook/preact';
import sessionRequest from '../../playground/utils/sessionRequest';
import { createAdyenPlatformExperience } from '../../.storybook/utils/create-adyenPE';

interface IContainer<T extends new (...args: any) => any> {
    component: T;
    componentConfiguration: Omit<ConstructorParameters<T>[0], 'core'>;
    context: StoryContext<PreactRenderer, any>;
    mockedApi?: boolean;
}

export const Container = <T extends new (args: any) => any>({ component, componentConfiguration, context }: IContainer<T>) => {
    const container = useRef(null);

    useEffect(() => {
        const getCore = async () => {
            const AdyenPlatformExperience = await createAdyenPlatformExperience({
                ...context.coreOptions,
                balanceAccountId: context.args.balanceAccountId,
                environment: 'test',
                onSessionCreate: async () => {
                    return await sessionRequest(context.args.session);
                },
                ...context.args.coreOptions,
            });
            const Component = new component({ ...componentConfiguration, core: AdyenPlatformExperience });

            Component.mount(container.current ?? '');
            return { AdyenPlatformExperience };
        };

        void getCore();
    }, []);

    return <div ref={container} id="component-root" className="component-wrapper" />;
};
