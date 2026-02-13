/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import withTabbableRoot, { focusIsWithin, getDeepActiveElement, isTabbable } from './tabbable';

describe('isTabbable', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        vi.clearAllMocks();
    });

    test('identifies tabbable elements', () => {
        const input = document.createElement('input');
        const button = document.createElement('button');
        const div = document.createElement('div');
        const link = document.createElement('a');
        link.href = '#';

        // Elements must be attached for :scope selectors to work reliably in some environments
        container.appendChild(input);
        container.appendChild(button);
        container.appendChild(div);
        container.appendChild(link);

        expect(isTabbable(input)).toBe(true);
        expect(isTabbable(button)).toBe(true);
        expect(isTabbable(link)).toBe(true);
        expect(isTabbable(div)).toBe(false);
    });

    test('respects disabled attribute', () => {
        const input = document.createElement('input');
        input.disabled = true;
        container.appendChild(input);
        expect(isTabbable(input)).toBe(false);
    });

    test('respects tabindex="-1"', () => {
        const button = document.createElement('button');
        button.tabIndex = -1;
        container.appendChild(button);
        expect(isTabbable(button)).toBe(false);
    });

    test('respects hidden attribute', () => {
        const input = document.createElement('input');
        input.hidden = true;
        container.appendChild(input);
        expect(isTabbable(input)).toBe(false);
    });

    test('handles radio buttons correctly', () => {
        const form = document.createElement('form');
        const radio1 = document.createElement('input');
        radio1.type = 'radio';
        radio1.name = 'group1';
        radio1.checked = true;

        const radio2 = document.createElement('input');
        radio2.type = 'radio';
        radio2.name = 'group1';

        form.appendChild(radio1);
        form.appendChild(radio2);
        container.appendChild(form);

        // Checked radio should be tabbable
        expect(isTabbable(radio1)).toBe(true);

        // Unchecked radio in same group should NOT be tabbable
        expect(isTabbable(radio2)).toBe(false);
    });
});

describe('getDeepActiveElement', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        vi.clearAllMocks();
    });

    test('returns active element in light DOM', () => {
        const input = document.createElement('input');
        container.appendChild(input);
        input.focus();
        expect(getDeepActiveElement()).toBe(input);
    });

    test('returns active element inside Shadow DOM', () => {
        const host = document.createElement('div');
        const shadow = host.attachShadow({ mode: 'open' });
        const input = document.createElement('input');
        shadow.appendChild(input);
        container.appendChild(host);

        input.focus();
        expect(getDeepActiveElement()).toBe(input);
    });

    test('returns active element inside nested Shadow DOM', () => {
        const host1 = document.createElement('div');
        const shadow1 = host1.attachShadow({ mode: 'open' });
        const host2 = document.createElement('div');
        const shadow2 = host2.attachShadow({ mode: 'open' });
        const input = document.createElement('input');

        shadow2.appendChild(input);
        shadow1.appendChild(host2);
        container.appendChild(host1);

        input.focus();
        expect(getDeepActiveElement()).toBe(input);
    });
});

describe('focusIsWithin', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        vi.clearAllMocks();
    });

    test('returns true when focus is inside root', () => {
        const input = document.createElement('input');
        container.appendChild(input);
        input.focus();
        expect(focusIsWithin(container)).toBe(true);
    });

    test('returns false when focus is outside root', () => {
        const outsideInput = document.createElement('input');
        document.body.appendChild(outsideInput);
        outsideInput.focus();
        expect(focusIsWithin(container)).toBe(false);
        document.body.removeChild(outsideInput);
    });

    test('handles Shadow DOM boundaries', () => {
        const host = document.createElement('div');
        const shadow = host.attachShadow({ mode: 'open' });
        const input = document.createElement('input');
        shadow.appendChild(input);
        container.appendChild(host);

        input.focus();
        expect(focusIsWithin(container)).toBe(true);
    });
});

describe('withTabbableRoot', () => {
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        vi.clearAllMocks();
    });

    test('finds tabbable elements in Light DOM', () => {
        const input1 = document.createElement('input');
        const button1 = document.createElement('button');
        const div = document.createElement('div');

        container.appendChild(input1);
        container.appendChild(div);
        container.appendChild(button1);

        const tabbableRoot = withTabbableRoot();
        tabbableRoot.root = container;

        expect(tabbableRoot.tabbables).toEqual([input1, button1]);
    });

    test('finds tabbable elements inside Shadow DOM', () => {
        const host = document.createElement('div');
        const shadow = host.attachShadow({ mode: 'open' });
        const shadowInput = document.createElement('input');
        shadow.appendChild(shadowInput);

        const lightInput = document.createElement('input');

        container.appendChild(lightInput);
        container.appendChild(host);

        const tabbableRoot = withTabbableRoot();
        tabbableRoot.root = container;

        expect(tabbableRoot.tabbables).toEqual([lightInput, shadowInput]);
    });

    test('finds tabbable elements in nested Shadow DOM', () => {
        const host1 = document.createElement('div');
        const shadow1 = host1.attachShadow({ mode: 'open' });

        const host2 = document.createElement('div');
        const shadow2 = host2.attachShadow({ mode: 'open' });
        const deepInput = document.createElement('input');

        shadow2.appendChild(deepInput);
        shadow1.appendChild(host2);
        container.appendChild(host1);

        const tabbableRoot = withTabbableRoot();
        tabbableRoot.root = container;

        expect(tabbableRoot.tabbables).toEqual([deepInput]);
    });

    test('updates when elements are added dynamically', async () => {
        const tabbableRoot = withTabbableRoot();
        tabbableRoot.root = container;

        expect(tabbableRoot.tabbables).toEqual([]);

        const input = document.createElement('input');
        container.appendChild(input);

        // Wait for MutationObserver
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(tabbableRoot.tabbables).toEqual([input]);
    });

    test('updates when attributes change', async () => {
        const input = document.createElement('input');
        input.disabled = true;
        container.appendChild(input);

        const tabbableRoot = withTabbableRoot();
        tabbableRoot.root = container;

        expect(tabbableRoot.tabbables).toEqual([]);

        input.disabled = false;

        // Wait for MutationObserver
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(tabbableRoot.tabbables).toEqual([input]);
    });

    test('updates when Shadow DOM content is added', async () => {
        const host = document.createElement('div');
        const shadow = host.attachShadow({ mode: 'open' });
        container.appendChild(host);

        const tabbableRoot = withTabbableRoot();
        tabbableRoot.root = container;

        expect(tabbableRoot.tabbables).toEqual([]);

        const input = document.createElement('input');
        shadow.appendChild(input);

        // Wait for MutationObserver
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(tabbableRoot.tabbables).toEqual([input]);
    });

    test('updates when a wrapper with Shadow DOM is added', async () => {
        const tabbableRoot = withTabbableRoot();
        tabbableRoot.root = container;

        expect(tabbableRoot.tabbables).toEqual([]);

        const wrapper = document.createElement('div');
        const host = document.createElement('div');
        const shadow = host.attachShadow({ mode: 'open' });
        const input = document.createElement('input');
        shadow.appendChild(input);
        wrapper.appendChild(host);

        container.appendChild(wrapper);

        // Wait for MutationObserver
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(tabbableRoot.tabbables).toEqual([input]);
    });

    test('updates when a wrapper with Shadow DOM is removed', async () => {
        const wrapper = document.createElement('div');
        const host = document.createElement('div');
        const shadow = host.attachShadow({ mode: 'open' });
        const input = document.createElement('input');
        shadow.appendChild(input);
        wrapper.appendChild(host);
        container.appendChild(wrapper);

        const tabbableRoot = withTabbableRoot();
        tabbableRoot.root = container;

        expect(tabbableRoot.tabbables).toEqual([input]);

        container.removeChild(wrapper);

        // Wait for MutationObserver
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(tabbableRoot.tabbables).toEqual([]);
    });

    test('manages current focus index', () => {
        const input1 = document.createElement('input');
        const input2 = document.createElement('input');
        container.appendChild(input1);
        container.appendChild(input2);

        const tabbableRoot = withTabbableRoot();
        tabbableRoot.root = container;

        // Set by element
        tabbableRoot.current = input2;
        expect(document.activeElement).toBe(input2);
        expect(tabbableRoot.current).toBe(input2);

        // Set by offset (next)
        tabbableRoot.current = 1;
        expect(document.activeElement).toBe(input1);
        expect(tabbableRoot.current).toBe(input1);
    });

    test('clears tabbables when root is removed', () => {
        const input = document.createElement('input');
        container.appendChild(input);

        const tabbableRoot = withTabbableRoot();
        tabbableRoot.root = container;
        expect(tabbableRoot.tabbables).toEqual([input]);

        tabbableRoot.root = null;
        expect(tabbableRoot.tabbables).toEqual([]);
    });
});
