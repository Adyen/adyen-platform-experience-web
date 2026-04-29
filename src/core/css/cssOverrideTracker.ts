import type { CSSOverrideReport, CSSOverrideTrackerOptions } from './types';
import { DEFAULT_DEBOUNCE_MS, SDK_CLASS_PREFIX, SDK_STYLESHEET_ATTR, SDK_STYLESHEET_ATTR_VALUE } from './constants';

const SDK_CLASS_REGEX_CACHE = new Map<string, RegExp>();

function getSdkClassRegex(prefix: string): RegExp {
    let regex = SDK_CLASS_REGEX_CACHE.get(prefix);
    if (!regex) {
        regex = new RegExp(`\\.${prefix.replaceAll('-', '\\-')}[\\w-]+`, 'g');
        SDK_CLASS_REGEX_CACHE.set(prefix, regex);
    }
    return regex;
}

function extractSdkClasses(selectorText: string, prefix: string): string[] {
    const regex = getSdkClassRegex(prefix);
    regex.lastIndex = 0;
    const matches = selectorText.match(regex);
    if (!matches) return [];
    return matches.map(m => m.slice(1));
}

function isSdkOwned(sheet: CSSStyleSheet, attr: string, attrValue: string): boolean {
    const ownerNode = sheet.ownerNode;
    if (ownerNode && 'getAttribute' in ownerNode) {
        return (ownerNode as Element).getAttribute(attr) === attrValue;
    }
    return false;
}

function processRule(rule: CSSRule, overridden: Map<string, Set<string>>, prefix: string): void {
    if (rule instanceof CSSStyleRule) {
        const classes = extractSdkClasses(rule.selectorText, prefix);
        for (const cls of classes) {
            let props = overridden.get(cls);
            if (!props) {
                props = new Set();
                overridden.set(cls, props);
            }
            for (let i = 0; i < rule.style.length; i++) {
                props.add(rule.style[i]!);
            }
        }
    } else if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule) {
        for (const nested of rule.cssRules) {
            processRule(nested, overridden, prefix);
        }
    }
}

export function scanOverrides(options: CSSOverrideTrackerOptions = {}): CSSOverrideReport {
    const prefix = options.sdkClassPrefix ?? SDK_CLASS_PREFIX;
    const attr = options.sdkStylesheetAttr ?? SDK_STYLESHEET_ATTR;
    const attrValue = options.sdkStylesheetAttrValue ?? SDK_STYLESHEET_ATTR_VALUE;
    const start = performance.now();

    const overridden = new Map<string, Set<string>>();
    let crossOriginSheetsSkipped = 0;

    for (const sheet of document.styleSheets) {
        if (isSdkOwned(sheet, attr, attrValue)) continue;

        let rules: CSSRuleList;
        try {
            rules = sheet.cssRules;
        } catch {
            crossOriginSheetsSkipped++;
            continue;
        }

        for (const rule of rules) {
            processRule(rule, overridden, prefix);
        }
    }

    const scanMs = Math.round((performance.now() - start) * 100) / 100;

    return {
        type: 'css_override_report',
        sdkVersion: process.env.VITE_VERSION ?? 'unknown',
        overriddenClasses: [...overridden.keys()],
        perClassProps: Object.fromEntries([...overridden].map(([k, v]) => [k, [...v]])),
        crossOriginSheetsSkipped,
        scanMs,
    };
}

export class CSSOverrideTracker {
    private options: Required<CSSOverrideTrackerOptions>;
    private observer: MutationObserver | null = null;
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;
    private _lastReport: CSSOverrideReport | null = null;

    constructor(options: CSSOverrideTrackerOptions = {}) {
        this.options = {
            sdkClassPrefix: options.sdkClassPrefix ?? SDK_CLASS_PREFIX,
            sdkStylesheetAttr: options.sdkStylesheetAttr ?? SDK_STYLESHEET_ATTR,
            sdkStylesheetAttrValue: options.sdkStylesheetAttrValue ?? SDK_STYLESHEET_ATTR_VALUE,
            debounceMs: options.debounceMs ?? DEFAULT_DEBOUNCE_MS,
            onReport: options.onReport ?? (() => {}),
        };
    }

    get lastReport(): CSSOverrideReport | null {
        return this._lastReport;
    }

    scan(): CSSOverrideReport {
        const report = scanOverrides(this.options);
        this._lastReport = report;
        this.options.onReport(report);
        return report;
    }

    start(): void {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        if (this.observer) return;

        if ('requestIdleCallback' in window) {
            (window as Window).requestIdleCallback(() => this.scan());
        } else {
            setTimeout(() => this.scan(), 0);
        }

        this.observe();
    }

    stop(): void {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        if (this.debounceTimer !== null) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
    }

    private observe(): void {
        if (!document.head) return;

        this.observer = new MutationObserver(mutations => {
            const hasStyleChange = mutations.some(
                m =>
                    m.type === 'childList' &&
                    [...m.addedNodes, ...m.removedNodes].some(node => node instanceof HTMLStyleElement || node instanceof HTMLLinkElement)
            );

            if (hasStyleChange) {
                this.debouncedScan();
            }
        });

        this.observer.observe(document.head, { childList: true });
    }

    private debouncedScan(): void {
        if (this.debounceTimer !== null) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.scan();
            this.debounceTimer = null;
        }, this.options.debounceMs);
    }
}
