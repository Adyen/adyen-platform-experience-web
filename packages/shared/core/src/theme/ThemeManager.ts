import type { CustomTheme, ThemeMode, ThemeVariables } from '../types';
import { ThemeGenerator } from '@adyen/adyen-shared-web';
import { THEME_MODE_ATTRIBUTE } from '@integration-components/types/theme';
import { uuid } from '@integration-components/utils';

const THEME_ROOT_ATTRIBUTE = 'data-adyen-pe-theme-root';

const hasVariables = (variables: ThemeVariables | undefined): variables is ThemeVariables => !!variables && Object.keys(variables).length > 0;

export class ThemeManager {
    private readonly id = uuid();
    private mode: ThemeMode = 'light';
    private customTheme?: CustomTheme;
    private readonly roots = new Set<Element>();
    private css?: string;
    private readonly styleElements = new Map<Document, HTMLStyleElement>();

    public apply(mode: ThemeMode = 'light', customTheme?: CustomTheme): void {
        const css = this.generateScopedCss(mode, customTheme?.[mode]);

        this.mode = mode;
        this.customTheme = customTheme;
        this.css = css;
        this.replaceStyles(css);
        this.roots.forEach(root => this.applyToRoot(root));
    }

    public register(root: Element): void {
        if (!this.css) {
            this.css = this.generateScopedCss(this.mode, this.customTheme?.[this.mode]);
        }

        this.roots.add(root);
        this.ensureStyle(root.ownerDocument);
        this.applyToRoot(root);
    }

    public unregister(root: Element): void {
        this.roots.delete(root);
        root.removeAttribute(THEME_MODE_ATTRIBUTE);
        root.removeAttribute(THEME_ROOT_ATTRIBUTE);

        if (!Array.from(this.roots).some(themeRoot => themeRoot.ownerDocument === root.ownerDocument)) {
            this.styleElements.get(root.ownerDocument)?.remove();
            this.styleElements.delete(root.ownerDocument);
        }
    }

    private applyToRoot(root: Element): void {
        root.setAttribute(THEME_ROOT_ATTRIBUTE, this.id);

        if (this.mode === 'dark') {
            root.setAttribute(THEME_MODE_ATTRIBUTE, 'dark');
        } else {
            root.removeAttribute(THEME_MODE_ATTRIBUTE);
        }
    }

    private generateScopedCss(mode: ThemeMode, variables: ThemeVariables | undefined): string | undefined {
        if (!hasVariables(variables) || typeof document === 'undefined') return;

        const generator = new ThemeGenerator();
        const existingElements = new Set(document.head.children);

        try {
            generator.create({
                ...variables,
                dark: mode === 'dark',
            });

            const generatedStyle = Array.from(document.head.children).find(
                element => !existingElements.has(element) && element instanceof HTMLStyleElement
            );
            if (!generatedStyle) return;

            return generatedStyle.textContent?.replace(':root', `[${THEME_ROOT_ATTRIBUTE}='${this.id}']`);
        } finally {
            generator.destroy();
        }
    }

    private replaceStyles(css: string | undefined): void {
        this.styleElements.forEach(styleElement => styleElement.remove());
        this.styleElements.clear();

        if (!css) return;

        new Set(Array.from(this.roots, root => root.ownerDocument)).forEach(ownerDocument => this.ensureStyle(ownerDocument));
    }

    private ensureStyle(ownerDocument: Document): void {
        if (!this.css || this.styleElements.has(ownerDocument)) return;

        const styleElement = ownerDocument.createElement('style');
        styleElement.textContent = this.css;
        ownerDocument.head.appendChild(styleElement);
        this.styleElements.set(ownerDocument, styleElement);
    }
}
