import { useEffect, useRef } from 'preact/compat';
import { StoryContext } from '@storybook/types';
import { PreactRenderer } from '@storybook/preact';
import { AdyenPlatformExperience } from '../../src';
import BaseElement from '../../src/components/external/BaseElement';
import sessionRequest from '../../playground/utils/sessionRequest';
import './styles.scss';

interface IContainer<T extends new (...args: any) => any> {
    component: T;
    componentConfiguration: Omit<ConstructorParameters<T>[0], 'core'>;
    context: StoryContext<PreactRenderer, any>;
    mockedApi?: boolean;
}

export const Container = <T extends new (args: any) => any>({ component, componentConfiguration, context }: IContainer<T>) => {
    const container = useRef(null);

    useEffect(() => {
        let Component: BaseElement<any>;

        void (async () => {
            const core = await AdyenPlatformExperience({
                ...context.coreOptions,
                balanceAccountId: context.args.balanceAccountId,
                environment: 'test',
                onSessionCreate: async () => {
                    return await sessionRequest(context.args.session);
                },
                ...context.args.coreOptions,
            });

            Component = new component({ ...componentConfiguration, core });
            Component.mount(container.current ?? '');
        })();

        return () => Component.unmount();
    }, []);

    return <div ref={container} id="component-root" className="component-wrapper" />;
};
