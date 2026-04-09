import { Core } from '../../../../index';
import type { ComponentType } from 'preact';
import type { RenderHandle, RenderOptions, CdnComponentName, InferCdnComponentProps } from '../../types';
import { h, render as preactRender } from 'preact';

export const createCdnRenderer = <C extends Core>(core: C) => {
    return async <Name extends CdnComponentName>(options: RenderOptions<Name>): Promise<RenderHandle<InferCdnComponentProps<Name>>> => {
        const { component: name, props, container } = options;
        const component = await core.getCdnComponent<ComponentType<InferCdnComponentProps<Name>>>({ name });

        if (component) {
            preactRender(h(component, props ?? null), container);
        }

        return {
            rerender(newProps) {
                if (component) {
                    preactRender(h(component, newProps ?? null), container);
                }
            },
            destroy() {
                preactRender(null, container);
            },
        };
    };
};
