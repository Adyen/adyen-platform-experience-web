import type { CustomThemes, ThemeMode, ThemeVariables } from '../types';
import { createThemeStyleGenerator, type ThemeStyleGenerator } from './ThemeGeneratorAdapter';

export const THEME_MODE_ATTRIBUTE = 'data-adyen-pe-theme';

const themeManagers = new WeakMap<Document, ThemeManager>();

const hasVariables = (variables: ThemeVariables | undefined): variables is ThemeVariables => !!variables && Object.keys(variables).length > 0;

export class ThemeManager {
    public constructor(
        private readonly targetDocument: Document,
        private readonly generator: ThemeStyleGenerator
    ) {}

    public apply(mode: ThemeMode = 'light', customThemes?: CustomThemes): void {
        const variables = customThemes?.[mode];

        if (hasVariables(variables)) {
            this.generator.create({
                ...variables,
                dark: mode === 'dark',
            });
        } else {
            this.generator.destroy();
        }

        if (mode === 'dark') {
            this.targetDocument.documentElement.setAttribute(THEME_MODE_ATTRIBUTE, 'dark');
        } else {
            this.targetDocument.documentElement.removeAttribute(THEME_MODE_ATTRIBUTE);
        }
    }
}

const getDefaultDocument = (): Document | undefined => (typeof document === 'undefined' ? undefined : document);

export const applyTheme = (
    mode: ThemeMode | undefined,
    customThemes?: CustomThemes,
    targetDocument: Document | undefined = getDefaultDocument()
): void => {
    if (!targetDocument) return;

    let manager = themeManagers.get(targetDocument);

    if (!manager) {
        manager = new ThemeManager(targetDocument, createThemeStyleGenerator());
        themeManagers.set(targetDocument, manager);
    }

    manager.apply(mode, customThemes);
};
