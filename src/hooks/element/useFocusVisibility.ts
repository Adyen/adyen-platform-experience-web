import { Ref } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import useReflex from '../useReflex';

const FOCUS_EVENTS = ['focus', 'blur'] as const;

/**
 * Provides real time information about focus visibility decision of the user-agent for the target element
 * referenced by the associated {@link Ref ref} object. An element can have focus and yet the user-agent
 * decides, based on some heuristics, that its focus shouldn't be made evident. This hook relies on both
 * the CSS {@link https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible :focus-visible} pseudo-class
 * selector and some focus events to provide this information.
 *
 * This hook should only be used when additional styling or behavior is needed for a non-focusable parent of a
 * focusable (interactive) element, but there is some limitation beyond the scope of what CSS provides or due
 * to limited support for newer CSS selectors such as `:has()`, `:is()`, `:where()`, etc.
 *
 * @example
 * // The same can be achieved by adding a style for `email:has(input:focus-visible)`
 * // But due to limited support for the `:has()` selector in many modern browsers,
 * // the `useFocusVisibility` hook was used instead.
 *
 * function Component() {
 *     const { hasVisibleFocus, ref: inputRef } = useFocusVisibility<HTMLInputElement>();
 *     return (
 *         <div className={cx('input', { 'input--focused': hasVisibleFocus })}>
 *             <input ref={inputRef} type="text" name="username" />
 *             <span>@example.com</span>
 *         </div>
 *     );
 * }
 */
export const useFocusVisibility = <Elem extends HTMLElement>() => {
    const [hasVisibleFocus, setHasVisibleFocus] = useState(false);

    const ref: Ref<Elem> = useReflex<Elem>(
        useMemo(() => {
            const updateFocusVisibility = (event: FocusEvent) => {
                const element = event.target as HTMLElement;
                setHasVisibleFocus(!!element?.matches(':focus-visible'));
            };

            return (current, previous) => {
                if (previous instanceof HTMLElement) {
                    FOCUS_EVENTS.forEach(event => {
                        previous.removeEventListener(event, updateFocusVisibility, false);
                    });
                }
                if (current instanceof HTMLElement) {
                    FOCUS_EVENTS.forEach(event => {
                        current.addEventListener(event, updateFocusVisibility, false);
                    });
                }
            };
        }, [])
    );

    return { hasVisibleFocus, ref } as const;
};

export default useFocusVisibility;
