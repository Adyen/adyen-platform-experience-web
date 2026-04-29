// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CSSOverrideTracker, scanOverrides } from './cssOverrideTracker';
import { SDK_STYLESHEET_ATTR, SDK_STYLESHEET_ATTR_VALUE } from './constants';

function addStyle(css: string, attrs?: Record<string, string>) {
    const style = document.createElement('style');
    if (attrs) {
        for (const [key, value] of Object.entries(attrs)) {
            style.setAttribute(key, value);
        }
    }
    style.textContent = css;
    document.head.appendChild(style);
    return style;
}

describe('scanOverrides', () => {
    afterEach(() => {
        document.head.querySelectorAll('style').forEach(s => s.remove());
    });

    it('should return an empty report when no host stylesheets exist', () => {
        const report = scanOverrides();
        expect(report.type).toBe('css_override_report');
        expect(report.overriddenClasses).toEqual([]);
        expect(report.perClassProps).toEqual({});
        expect(report.crossOriginSheetsSkipped).toBe(0);
    });

    it('should detect host CSS overriding SDK classes', () => {
        addStyle('.adyen-pe-button { color: red; padding: 10px; }');

        const report = scanOverrides();
        expect(report.overriddenClasses).toContain('adyen-pe-button');
        expect(report.perClassProps['adyen-pe-button']).toContain('color');
        expect(report.perClassProps['adyen-pe-button']).toContain('padding');
    });

    it('should skip SDK-owned stylesheets', () => {
        const style = addStyle('.adyen-pe-button { color: red; }', {
            [SDK_STYLESHEET_ATTR]: SDK_STYLESHEET_ATTR_VALUE,
        });

        // jsdom does not populate CSSStyleSheet.ownerNode, so patch it for this test
        const sheet = style.sheet!;
        Object.defineProperty(sheet, 'ownerNode', { value: style, configurable: true });

        const report = scanOverrides();
        expect(report.overriddenClasses).toEqual([]);
    });

    it('should not report non-SDK classes', () => {
        addStyle('.my-custom-class { color: blue; }');

        const report = scanOverrides();
        expect(report.overriddenClasses).toEqual([]);
    });

    it('should extract SDK classes from compound selectors', () => {
        addStyle('.host .adyen-pe-input:hover { border: 1px solid red; }');

        const report = scanOverrides();
        expect(report.overriddenClasses).toContain('adyen-pe-input');
        expect(report.perClassProps['adyen-pe-input']).toContain('border');
    });

    it('should handle multiple SDK classes in a single selector', () => {
        addStyle('.adyen-pe-button .adyen-pe-icon { margin: 0; }');

        const report = scanOverrides();
        expect(report.overriddenClasses).toContain('adyen-pe-button');
        expect(report.overriddenClasses).toContain('adyen-pe-icon');
    });

    it('should aggregate properties across multiple rules', () => {
        addStyle('.adyen-pe-button { color: red; }');
        addStyle('.adyen-pe-button { padding: 10px; }');

        const report = scanOverrides();
        expect(report.perClassProps['adyen-pe-button']).toContain('color');
        expect(report.perClassProps['adyen-pe-button']).toContain('padding');
    });

    it('should support a custom SDK class prefix', () => {
        addStyle('.acme-widget { color: red; }');

        const report = scanOverrides({ sdkClassPrefix: 'acme-' });
        expect(report.overriddenClasses).toContain('acme-widget');
    });

    it('should handle @media rules containing SDK class overrides', () => {
        addStyle('@media (min-width: 768px) { .adyen-pe-card { display: flex; } }');

        const report = scanOverrides();
        expect(report.overriddenClasses).toContain('adyen-pe-card');
        expect(report.perClassProps['adyen-pe-card']).toContain('display');
    });

    it('should include scanMs as a non-negative number', () => {
        const report = scanOverrides();
        expect(report.scanMs).toBeGreaterThanOrEqual(0);
    });
});

describe('CSSOverrideTracker', () => {
    afterEach(() => {
        document.head.querySelectorAll('style').forEach(s => s.remove());
    });

    it('should scan and store the last report', () => {
        addStyle('.adyen-pe-button { color: red; }');

        const tracker = new CSSOverrideTracker();
        const report = tracker.scan();

        expect(tracker.lastReport).toBe(report);
        expect(report.overriddenClasses).toContain('adyen-pe-button');
    });

    it('should call onReport callback on scan', () => {
        const onReport = vi.fn();
        const tracker = new CSSOverrideTracker({ onReport });

        addStyle('.adyen-pe-input { border: none; }');
        tracker.scan();

        expect(onReport).toHaveBeenCalledOnce();
        expect(onReport.mock.calls[0]![0]!.overriddenClasses).toContain('adyen-pe-input');
    });

    it('should rescan when stylesheets are added to head after start', async () => {
        const onReport = vi.fn();
        const tracker = new CSSOverrideTracker({ onReport, debounceMs: 10 });

        tracker.start();
        await vi.waitFor(() => expect(onReport).toHaveBeenCalledOnce());

        addStyle('.adyen-pe-link { text-decoration: none; }');

        await vi.waitFor(() => expect(onReport).toHaveBeenCalledTimes(2), { timeout: 1000 });
        expect(onReport.mock.calls[1]![0]!.overriddenClasses).toContain('adyen-pe-link');

        tracker.stop();
    });

    it('should stop observing after stop is called', async () => {
        const onReport = vi.fn();
        const tracker = new CSSOverrideTracker({ onReport, debounceMs: 10 });

        tracker.start();
        await vi.waitFor(() => expect(onReport).toHaveBeenCalledOnce());

        tracker.stop();
        addStyle('.adyen-pe-link { text-decoration: none; }');

        await new Promise(r => setTimeout(r, 50));
        expect(onReport).toHaveBeenCalledOnce();
    });

    it('should not create multiple observers when start is called multiple times', async () => {
        const observeSpy = vi.spyOn(MutationObserver.prototype, 'observe');
        const disconnectSpy = vi.spyOn(MutationObserver.prototype, 'disconnect');
        const onReport = vi.fn();
        const tracker = new CSSOverrideTracker({ onReport, debounceMs: 10 });

        tracker.start();
        tracker.start();
        tracker.start();

        expect(observeSpy).toHaveBeenCalledTimes(1);

        tracker.stop();
        expect(disconnectSpy).toHaveBeenCalledTimes(1);

        observeSpy.mockRestore();
        disconnectSpy.mockRestore();
    });

    it('should debounce multiple rapid stylesheet additions', async () => {
        const onReport = vi.fn();
        const tracker = new CSSOverrideTracker({ onReport, debounceMs: 50 });

        tracker.start();
        await vi.waitFor(() => expect(onReport).toHaveBeenCalledOnce());

        addStyle('.adyen-pe-a { color: red; }');
        addStyle('.adyen-pe-b { color: blue; }');
        addStyle('.adyen-pe-c { color: green; }');

        await vi.waitFor(() => expect(onReport).toHaveBeenCalledTimes(2), { timeout: 1000 });

        const lastReport = onReport.mock.calls[1]![0]!;
        expect(lastReport.overriddenClasses).toContain('adyen-pe-a');
        expect(lastReport.overriddenClasses).toContain('adyen-pe-b');
        expect(lastReport.overriddenClasses).toContain('adyen-pe-c');

        tracker.stop();
    });
});
