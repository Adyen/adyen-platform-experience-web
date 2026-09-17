import type { CustomTheme, ThemeMode, ThemeVariables } from '../types';
import { ThemeGenerator } from '@adyen/adyen-shared-web';
import { THEME_MODE_ATTRIBUTE, THEME_ROOT_ATTRIBUTE } from '@integration-components/types/theme';
import { uuid } from '@integration-components/utils';

const hasVariables = (variables: ThemeVariables | undefined): variables is ThemeVariables =>
    !!variables && Object.values(variables).some(value => value !== undefined);

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
        const currentOwner = root.getAttribute(THEME_ROOT_ATTRIBUTE);
        if (currentOwner && currentOwner !== this.id) {
            throw new Error(
                '[AdyenPlatformExperience] This element is already themed by another Core instance. Give each Core instance its own mount target.'
            );
        }

        if (!this.css) {
            this.css = this.generateScopedCss(this.mode, this.customTheme?.[this.mode]);
        }

        this.roots.add(root);
        this.ensureStyle(root.ownerDocument);
        this.applyToRoot(root);
    }

    public unregister(root: Element): void {
        this.roots.delete(root);
        if (root.getAttribute(THEME_ROOT_ATTRIBUTE) === this.id) {
            root.removeAttribute(THEME_MODE_ATTRIBUTE);
            root.removeAttribute(THEME_ROOT_ATTRIBUTE);
        }

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
        if (!hasVariables(variables)) return;

        return (
            new ThemeGenerator().generateCSS(
                {
                    ...variables,
                    dark: mode === 'dark',
                },
                { selector: `[${THEME_ROOT_ATTRIBUTE}='${this.id}']` }
            ) ?? undefined
        );
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
