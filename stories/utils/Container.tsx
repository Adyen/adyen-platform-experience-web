import { useEffect, useRef } from 'preact/compat';
import { StoryContext } from '@storybook/types';
import { PreactRenderer } from '@storybook/preact';
import { AdyenPlatformExperience, PayoutsOverview, ReportsOverview } from '../../src';
import BaseElement from '../../src/components/external/BaseElement';
import sessionRequest from './sessionRequest';
import './styles.scss';

interface IContainer<T extends new (...args: any) => any> {
    component: T;
    componentConfiguration: Omit<ConstructorParameters<T>[0], 'core'>;
    context: StoryContext<PreactRenderer, any>;
    mockedApi?: boolean;
    locale?: string;
}

export const Container = <T extends new (args: any) => any>({ component, componentConfiguration, context, locale }: IContainer<T>) => {
    const container = useRef(null);
    const container2 = useRef(null);
    const container3 = useRef(null);

    useEffect(() => {
        let Component: BaseElement<any>;
        let Component2: BaseElement<any>;
        let Component3: BaseElement<any>;

        void (async () => {
            const core = await AdyenPlatformExperience({
                ...context.coreOptions,
                balanceAccountId: context.args.balanceAccountId,
                environment: 'test',
                locale: locale || 'en-US',
                translations: {
                    en_US: {
                        ['hey']: 'Test old translation',
                        ['common.filters.types.date.label']: 'Test new translation',
                        ['balanceAccounts.all']: 'Test new translation',
                    },
                },
                onSessionCreate: async () => {
                    return await sessionRequest(context.args.session);
                },
                ...context.args.coreOptions,
            });

            Component = new component({ ...componentConfiguration, core });
            Component2 = new PayoutsOverview({ core });
            Component3 = new ReportsOverview({ core });
            Component.mount(container.current ?? '');
            Component2.mount(container2.current ?? '');
            Component3.mount(container3.current ?? '');
        })();

        return () => Component.unmount();
    }, []);

    return (
        <>
            <div ref={container} id="component-root" className="component-wrapper" />
            <div ref={container2} id="component-root2" className="component-wrapper" />
            <div ref={container3} id="component-root3" className="component-wrapper" />
        </>
    );
};
