import type { CoreOptions, onErrorHandler } from './types';
import { CoreBase } from '../../packages/shared/core/src/CoreBase';
import BaseElement from '../components/external/BaseElement';
import Localization, { TranslationSourceRecord } from './Localization';
import { EMPTY_OBJECT } from '../utils';
import { AssetOptions, Assets } from './Assets/Assets';
import { getCustomTranslationsAnalyticsPayload } from './Analytics/analytics/customTranslations';
import { SERVER_SIDE_INITIALIZATION_WARNING, shouldWarnAboutServerSideInitialization } from './runtime';

class Core<AvailableTranslations extends TranslationSourceRecord[] = [], CustomTranslations extends object = Record<never, never>> extends CoreBase<
    CoreOptions<AvailableTranslations, CustomTranslations>
> {
    public static readonly version = process.env.VITE_VERSION!;

    public components: BaseElement<any>[] = [];

    public localization: Localization;
    public onError?: onErrorHandler;
    public getImageAsset: (props: AssetOptions) => string;
    public getDatasetAsset: (props: AssetOptions) => string;

    private hasWarnedAboutServerSideInitialization = false;
    private readyCustomTranslationsAnalytics = false;

    // [TODO]: Change the error handling strategy.

    constructor(options: CoreOptions<AvailableTranslations, CustomTranslations>) {
        super(options);
        const { cdnTranslationsUrl, cdnAssetsUrl, cdnConfigUrl } = this.resolveEnvironment();

        this.localization = new Localization(options.locale, options.availableTranslations, cdnTranslationsUrl, cdnConfigUrl);
        this.getImageAsset = new Assets(cdnAssetsUrl).getAsset({ extension: 'svg', subFolder: 'images' });
        this.getDatasetAsset = new Assets(cdnAssetsUrl).getAsset({ extension: 'json', mainFolder: 'datasets' });

        // Apply options now that localization is initialised.
        this.setOptions(options);
    }

    async initialize(): Promise<this> {
        if (!this.hasWarnedAboutServerSideInitialization && shouldWarnAboutServerSideInitialization()) {
            console.warn(SERVER_SIDE_INITIALIZATION_WARNING);
            this.hasWarnedAboutServerSideInitialization = true;
        }

        return Promise.all([this.localization.ready]).then(() => {
            if (!this.readyCustomTranslationsAnalytics && this.analyticsEnabled) {
                const analyticsPayload = this.setTranslationsPayload();
                if (analyticsPayload.length > 0) {
                    this.session.analyticsPayload = analyticsPayload;
                    this.readyCustomTranslationsAnalytics = true;
                }
            }
            return this;
        });
    }

    /**
     * Updates global configurations, resets the internal state and remounts each element.
     * @param options - props to update
     * @returns this - the element instance
     */
    public override update = async (options: Partial<typeof this.options> = EMPTY_OBJECT): Promise<this> => {
        this.setOptions(options);
        await this.initialize();

        this.components.forEach(component => {
            if (component.props.core === this) {
                // Update each component under this instance
                component.update(this.getPropsForComponent(this.options));
            }
        });

        return this;
    };

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

    /**
     * @internal
     * Reacts to option changes by propagating locale / custom translations to Localization.
     */
    protected onOptionsChanged(_options: Partial<typeof this.options>): void {
        if (!this.localization) return;
        this.localization.locale = this.options?.locale;
        this.localization.customTranslations = this.options?.translations;
    }

    private setTranslationsPayload() {
        if (this.localization) {
            return getCustomTranslationsAnalyticsPayload(this.localization.i18n.customTranslations);
        }
        return [];
    }

    /**
     * @internal
     * @param options - options that will be merged to the global Checkout props
     * @returns props for a new UIElement
     */
    private getPropsForComponent(options: any) {
        return { ...options };
    }
}

export default Core;
