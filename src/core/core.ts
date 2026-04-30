import type { CoreOptions } from './types';
import { CoreBase } from '../../packages/shared/core/src/CoreBase';
import BaseElement from '../components/external/BaseElement';
import { TranslationSourceRecord } from './Localization';
import { EMPTY_OBJECT } from '../utils';

class Core<AvailableTranslations extends TranslationSourceRecord[] = [], CustomTranslations extends object = Record<never, never>> extends CoreBase<
    CoreOptions<AvailableTranslations, CustomTranslations>
> {
    public static readonly version = process.env.SDK_VERSION!;

    public components: BaseElement<any>[] = [];

    /**
     * Updates global configurations, resets the internal state and remounts each element.
     * @param options - props to update
     * @returns this - the element instance
     */
    public override async update(options: Partial<typeof this.options> = EMPTY_OBJECT): Promise<this> {
        this.setOptions(options);
        await this.initialize();

        this.components.forEach(component => {
            if (component.props.core === this) {
                // Update each component under this instance
                component.update({ ...this.options });
            }
        });

        return this;
    }

    /**
     * Remove the reference of a component
     * @param component - reference to the component to be removed
     * @returns this - the element instance
     */
    public remove = (component: BaseElement<any>): this => {
        this.components = this.components.filter(c => c._id !== component._id);
        component.unmount();
        return this;
    };

    /**
     * @internal
     * Register components in core to be able to update them all at once
     */
    public registerComponent = (component: BaseElement<any>) => {
        if (component.props.core === this) {
            this.components.push(component);
        }
    };
}

export default Core;
