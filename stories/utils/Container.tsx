import { useEffect, useRef } from 'preact/compat';
import { StoryContext } from '@storybook/preact';
import { AdyenPlatformExperience } from '../../src';
import { createCdnRenderer } from '../../src/core/Assets/components/adapters/preact';
import BaseElement from '../../src/components/external/BaseElement';
import Icon from '../../src/components/internal/Icon';
import sessionRequest from './sessionRequest';
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
                    return await sessionRequest(context.args.session);
                },
                ...(context.args.coreOptions ?? {}),
            });

            Component = new component({ ...componentConfiguration, core });
            Component.mount(container.current ?? '');

            if (container.current) {
                const wrapper = document.createElement('div');
                const renderer = createCdnRenderer(core);

                // Insert wrapper after the PIE component container
                (container.current as HTMLElement).insertAdjacentElement('afterend', wrapper);

                await renderer({
                    component: 'HelloWorld',
                    container: wrapper,
                    props: {
                        components: { Icon },
                    },
                });
            }
        })();

        return () => Component?.unmount();
    }, [component, componentConfiguration, context]);

    return (
        <>
            <div ref={container} id="component-root" className="component-wrapper" style={{ fontFamily: context.globals.fontFamily }} />
        </>
    );
};
