/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { CONTROL_ELEMENT_PROPERTY } from '../../../../hooks/element/useClickOutside';
import { popoverUtil } from './popoverUtil';

describe('popoverUtil', () => {
    afterEach(() => {
        popoverUtil.closeAll();
        vi.clearAllMocks();
    });

    test('should add and remove popovers', () => {
        const el = document.createElement('div');
        const callback = vi.fn();

        popoverUtil.add(el, callback);
        popoverUtil.closeAll();
        expect(callback).toHaveBeenCalledTimes(1);

        const callback2 = vi.fn();

        popoverUtil.add(el, callback2);
        popoverUtil.remove(el);
        popoverUtil.closeAll();
        expect(callback2).not.toHaveBeenCalled();
    });

    test('should not add duplicate popovers', () => {
        const el = document.createElement('div');
        const callback = vi.fn();

        popoverUtil.add(el, callback);
        popoverUtil.add(el, callback);
        popoverUtil.closeAll();
        expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should close all popovers', () => {
        const el1 = document.createElement('div');
        const el2 = document.createElement('div');
        const cb1 = vi.fn();
        const cb2 = vi.fn();

        popoverUtil.add(el1, cb1);
        popoverUtil.add(el2, cb2);
        popoverUtil.closeAll();
        expect(cb1).toHaveBeenCalledTimes(1);
        expect(cb2).toHaveBeenCalledTimes(1);
    });

    describe('closePopoversOutsideOfClick', () => {
        test('should close all popovers if click is outside of all', () => {
            const el1 = document.createElement('div');
            const cb1 = vi.fn();
            popoverUtil.add(el1, cb1);

            const outsideEl = document.createElement('div');
            const eventPath = [outsideEl, document.body];

            popoverUtil.closePopoversOutsideOfClick(eventPath);
            expect(cb1).toHaveBeenCalledTimes(1);
        });

        test('should not close popover if click is inside it', () => {
            const el1 = document.createElement('div');
            const cb1 = vi.fn();
            popoverUtil.add(el1, cb1);

            const innerEl = document.createElement('div');
            el1.appendChild(innerEl);

            const eventPath = [innerEl, el1, document.body];

            popoverUtil.closePopoversOutsideOfClick(eventPath);
            expect(cb1).not.toHaveBeenCalled();
        });

        test('should close nested popovers if click is inside parent but outside nested', () => {
            const parentEl = document.createElement('div');
            const nestedEl = document.createElement('div');
            const cbParent = vi.fn();
            const cbNested = vi.fn();

            popoverUtil.add(parentEl, cbParent);
            popoverUtil.add(nestedEl, cbNested);

            const eventPath = [parentEl, document.body];

            popoverUtil.closePopoversOutsideOfClick(eventPath);
            expect(cbNested).toHaveBeenCalledTimes(1);
            expect(cbParent).not.toHaveBeenCalled();
        });

        test('should not close any popovers if click is inside the most nested one', () => {
            const parentEl = document.createElement('div');
            const nestedEl = document.createElement('div');
            const cbParent = vi.fn();
            const cbNested = vi.fn();

            popoverUtil.add(parentEl, cbParent);
            popoverUtil.add(nestedEl, cbNested);

            const eventPath = [nestedEl, parentEl, document.body];

            popoverUtil.closePopoversOutsideOfClick(eventPath);
            expect(cbNested).not.toHaveBeenCalled();
            expect(cbParent).not.toHaveBeenCalled();
        });

        test('should not close popover if click is on its control element', () => {
            const el = document.createElement('div');
            const cb = vi.fn();
            popoverUtil.add(el, cb);

            const controlEl = document.createElement('div');
            (el as any)[CONTROL_ELEMENT_PROPERTY] = controlEl;

            const eventPath = [controlEl, document.body];

            popoverUtil.closePopoversOutsideOfClick(eventPath);
            expect(cb).not.toHaveBeenCalled();
        });

        test('should not close popover if click is inside its control element', () => {
            const el = document.createElement('div');
            const cb = vi.fn();
            popoverUtil.add(el, cb);

            const controlEl = document.createElement('div');
            const innerControl = document.createElement('div');

            controlEl.appendChild(innerControl);
            (el as any)[CONTROL_ELEMENT_PROPERTY] = controlEl;

            const eventPath = [innerControl, controlEl, document.body];

            popoverUtil.closePopoversOutsideOfClick(eventPath);
            expect(cb).not.toHaveBeenCalled();
        });
    });
});
