import type { ThemeOptions } from '../types';
import { createThemeStyleGenerator, type ThemeStyleGenerator } from './ThemeGeneratorAdapter';

export const THEME_MODE_ATTRIBUTE = 'data-adyen-pe-theme';

const themeManagers = new WeakMap<Document, ThemeManager>();

const hasVariables = (theme: ThemeOptions): boolean => !!theme.variables && Object.keys(theme.variables).length > 0;

export class ThemeManager {
    public constructor(
        private readonly targetDocument: Document,
        private readonly generator: ThemeStyleGenerator
    ) {}

    public apply(theme: ThemeOptions | undefined): void {
        const dark = theme?.mode === 'dark';

        if (theme && hasVariables(theme)) {
            this.generator.create({
                ...theme.variables,
                dark,
            });
        } else {
            this.generator.destroy();
        }

        if (dark) {
            this.targetDocument.documentElement.setAttribute(THEME_MODE_ATTRIBUTE, 'dark');
        } else {
            this.targetDocument.documentElement.removeAttribute(THEME_MODE_ATTRIBUTE);
        }
    }
}

const getDefaultDocument = (): Document | undefined => (typeof document === 'undefined' ? undefined : document);

export const applyTheme = (theme: ThemeOptions | undefined, targetDocument: Document | undefined = getDefaultDocument()): void => {
    if (!targetDocument) return;

    let manager = themeManagers.get(targetDocument);

    if (!manager) {
        manager = new ThemeManager(targetDocument, createThemeStyleGenerator());
        themeManagers.set(targetDocument, manager);
    }

    manager.apply(theme);
};
