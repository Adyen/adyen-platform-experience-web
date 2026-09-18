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
    private readonly portals = new Set<Element>();
    private css?: string;
    private readonly styleElements = new Map<Document, HTMLStyleElement>();
    private readonly portalObservers = new Map<Document, MutationObserver>();

    public apply(mode: ThemeMode = 'light', customTheme?: CustomTheme): void {
        const css = this.generateScopedCss(mode, customTheme?.[mode]);

        this.mode = mode;
        this.customTheme = customTheme;
        this.css = css;
        this.replaceStyles(css);
        this.roots.forEach(root => this.applyToRoot(root));
        this.portals.forEach(portal => this.applyToRoot(portal));
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
        this.ensurePortalObserver(root);
        this.applyToRoot(root);
    }

    public unregister(root: Element): void {
        this.roots.delete(root);
        this.removeFromRoot(root);

        if (!Array.from(this.roots).some(themeRoot => themeRoot.ownerDocument === root.ownerDocument)) {
            this.releasePortals(root.ownerDocument);
            this.portalObservers.get(root.ownerDocument)?.disconnect();
            this.portalObservers.delete(root.ownerDocument);
            this.styleElements.get(root.ownerDocument)?.remove();
            this.styleElements.delete(root.ownerDocument);
        } else {
            this.syncPortals(root.ownerDocument);
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

    private ensurePortalObserver(root: Element): void {
        const ownerDocument = root.ownerDocument;
        const Observer = ownerDocument.defaultView?.MutationObserver;
        if (!Observer || !ownerDocument.body) return;

        let observer = this.portalObservers.get(ownerDocument);
        if (!observer) {
            observer = new Observer(() => this.syncPortals(ownerDocument));
            this.portalObservers.set(ownerDocument, observer);
        }

        this.syncPortals(ownerDocument);
    }

    private syncPortals(ownerDocument: Document): void {
        const previousPortals = [...this.portals].filter(portal => portal.ownerDocument === ownerDocument);
        const ownedElements = [...this.roots].filter(element => element.ownerDocument === ownerDocument && element.isConnected);
        const currentPortals = new Set<Element>();

        for (let index = 0; index < ownedElements.length; index++) {
            const ownedElement = ownedElements[index]!;
            const controllers = ownedElement.matches('[aria-controls]')
                ? [ownedElement, ...ownedElement.querySelectorAll('[aria-controls]')]
                : [...ownedElement.querySelectorAll('[aria-controls]')];

            controllers.forEach(controller => {
                controller
                    .getAttribute('aria-controls')
                    ?.split(/\s+/)
                    .filter(Boolean)
                    .forEach(controlledId => {
                        const controlledElement = ownerDocument.getElementById(controlledId);
                        if (
                            !controlledElement ||
                            controlledElement.parentElement !== ownerDocument.body ||
                            ownedElements.some(element => element === controlledElement || element.contains(controlledElement))
                        )
                            return;

                        const currentOwner = controlledElement.getAttribute(THEME_ROOT_ATTRIBUTE);
                        if (currentOwner && currentOwner !== this.id) return;

                        currentPortals.add(controlledElement);
                        this.portals.add(controlledElement);
                        ownedElements.push(controlledElement);
                        this.applyToRoot(controlledElement);
                    });
            });
        }

        previousPortals.forEach(portal => {
            if (currentPortals.has(portal)) return;

            this.portals.delete(portal);
            this.removeFromRoot(portal);
        });

        this.resetPortalObserver(ownerDocument);
    }

    private resetPortalObserver(ownerDocument: Document): void {
        const observer = this.portalObservers.get(ownerDocument);
        if (!observer || !ownerDocument.body) return;

        observer.disconnect();
        observer.observe(ownerDocument.body, { childList: true });

        [...this.roots, ...this.portals]
            .filter(element => element.ownerDocument === ownerDocument && element.isConnected)
            .forEach(element =>
                observer.observe(element, {
                    attributes: true,
                    attributeFilter: ['aria-controls'],
                    subtree: true,
                })
            );
    }

    private releasePortals(ownerDocument: Document): void {
        this.portals.forEach(portal => {
            if (portal.ownerDocument !== ownerDocument) return;

            this.portals.delete(portal);
            this.removeFromRoot(portal);
        });
    }

    private removeFromRoot(root: Element): void {
        if (root.getAttribute(THEME_ROOT_ATTRIBUTE) !== this.id) return;

        root.removeAttribute(THEME_MODE_ATTRIBUTE);
        root.removeAttribute(THEME_ROOT_ATTRIBUTE);
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
