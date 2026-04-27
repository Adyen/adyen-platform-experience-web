import { CoreBase } from '../CoreBase';
import { createI18n } from './Context/i18n';
import type { I18n } from './Context/types';
import type { CoreOptions } from './types';

export class Core extends CoreBase<CoreOptions> {
    public i18n: I18n;

    constructor(options: CoreOptions) {
        super(options);
        const { cdnTranslationsUrl } = this.resolveEnvironment();

        this.i18n = createI18n(options.locale || 'en-US', cdnTranslationsUrl);

        // Apply options now that i18n is initialised.
        this.setOptions(options);
    }

    async initialize(): Promise<this> {
        await this.i18n.ready;
        return this;
    }

    protected onOptionsChanged(options: Partial<CoreOptions>): void {
        if (options.locale) {
            const { cdnTranslationsUrl } = this.resolveEnvironment();
            this.i18n = createI18n(options.locale, cdnTranslationsUrl);
        }
    }
}

export default Core;
