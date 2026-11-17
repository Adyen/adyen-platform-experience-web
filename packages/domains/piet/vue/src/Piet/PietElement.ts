import type { App } from 'vue';
import BentoVue from '@adyen/bento-vue3';
import { UIElement } from '@integration-components/core/vue';
import PietContainer from './components/PietContainer.vue';
import type { PietComponentProps, PietExternalProps } from './types';

/** The component calls the host's renderer with the element's `core`, which Piet's components don't have. */
const bindCore = <Props extends Partial<PietExternalProps>>(props: Props, core: PietExternalProps['core']): Props => {
    const { renderAction } = props;
    if (!renderAction) return props;
    const bound: PietComponentProps['renderAction'] = (request, container) => renderAction(request, container, core);
    return { ...props, renderAction: bound } as unknown as Props;
};

/**
 * Imperative wrapper for mounting Piet.
 *
 * Usage:
 *   const core = await new Core({ ... }).initialize();
 *   const piet = new PietElement({ core });
 *   piet.mount('#piet-container');
 *   piet.unmount();
 */
export class PietElement extends UIElement<PietExternalProps> {
    public static readonly type = 'piet' as const;

    constructor(props: PietExternalProps) {
        super(PietContainer, bindCore(props, props.core), 'piet');
    }

    public update(props: Partial<PietExternalProps>): this {
        return super.update(bindCore(props, this.core));
    }

    protected configureComponentApp(app: App): void {
        app.use(BentoVue, { withToast: true, withDesignTokensCSSInjection: false });
    }
}

export default PietElement;
