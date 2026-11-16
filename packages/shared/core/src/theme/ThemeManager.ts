import type { CustomTheme, ThemeMode, ThemeVariables } from '../types';
import type { ThemeGenerator } from '@adyen/adyen-shared-web';
import { THEME_MODE_ATTRIBUTE, THEME_ROOT_ATTRIBUTE } from '@integration-components/types/theme';
import { ALREADY_RESOLVED_PROMISE, uuid } from '@integration-components/utils';

const hasVariables = (variables: ThemeVariables | undefined): variables is ThemeVariables =>
    !!variables && Object.values(variables).some(value => value !== undefined);

type CreateThemeGenerator = () => ThemeGenerator;

let themeGeneratorLoader: Promise<CreateThemeGenerator> | undefined;

const loadThemeGenerator = (): Promise<CreateThemeGenerator> =>
    (themeGeneratorLoader ??= import('@adyen/adyen-shared-web').then(
        module => () => new module.ThemeGenerator(),
        error => {
            themeGeneratorLoader = undefined;
            throw error;
        }
    ));

export class ThemeManager {
    private readonly id = uuid();
    private mode: ThemeMode = 'light';
    private readonly roots = new Set<Element>();
    private css?: string;
    private readonly styleElements = new Map<Document, HTMLStyleElement>();
    private applyRequests = 0;
    private committedApplyRequest = 0;

    public apply(mode: ThemeMode = 'light', customTheme?: CustomTheme): Promise<void> {
        const applyRequest = ++this.applyRequests;
        const variables = customTheme?.[mode];

        if (!hasVariables(variables)) {
            this.commit(applyRequest, mode, undefined);
            return ALREADY_RESOLVED_PROMISE;
        }

        return loadThemeGenerator().then(createThemeGenerator => {
            this.commit(applyRequest, mode, this.generateScopedCss(createThemeGenerator(), mode, variables));
        });
    }

    public register(root: Element): void {
        const currentOwner = root.getAttribute(THEME_ROOT_ATTRIBUTE);
        if (currentOwner && currentOwner !== this.id) {
            throw new Error(
                '[AdyenPlatformExperience] This element is already themed by another Core instance. Give each Core instance its own mount target.'
            );
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

    private commit(applyRequest: number, mode: ThemeMode, css: string | undefined): void {
        if (applyRequest < this.committedApplyRequest) return;

        this.committedApplyRequest = applyRequest;
        this.mode = mode;
        this.css = css;
        this.replaceStyles(css);
        this.roots.forEach(root => this.applyToRoot(root));
    }

    private applyToRoot(root: Element): void {
        root.setAttribute(THEME_ROOT_ATTRIBUTE, this.id);

        if (this.mode === 'dark') {
            root.setAttribute(THEME_MODE_ATTRIBUTE, 'dark');
        } else {
            root.removeAttribute(THEME_MODE_ATTRIBUTE);
        }
    }

    private generateScopedCss(themeGenerator: ThemeGenerator, mode: ThemeMode, variables: ThemeVariables): string | undefined {
        return (
            themeGenerator.generateCSS(
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
