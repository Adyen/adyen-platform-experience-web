import { useEffect, useRef } from 'preact/compat';
import { StoryContext } from '@storybook/preact';
import { AdyenPlatformExperience } from '@integration-components/sdk-internal';
import type BaseElement from '../../../../../src/components/external/BaseElement';
import { getMySessionToken } from '@integration-components/testing/storybook-helpers';
import './styles.scss';

interface IContainer<T extends new (...args: any) => any> {
    component: T;
    componentConfiguration: Omit<ConstructorParameters<T>[0], 'core'>;
    context: StoryContext;
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
                locale: context.globals.locale,
                onSessionCreate: async () => {
                    return await getMySessionToken(context.args.session);
                },
                ...(context.args.coreOptions ?? {}),
            });

            Component = new component({ ...componentConfiguration, core });
            Component.mount(container.current ?? '');
        })();

        return () => Component?.unmount();
    }, [component, componentConfiguration, context]);

    return (
        <>
            <div ref={container} id="component-root" className="component-wrapper" style={{ fontFamily: context.globals.fontFamily }} />
        </>
    );
};
