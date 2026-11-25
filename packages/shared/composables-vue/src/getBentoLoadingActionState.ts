/**
 * Props for a Bento button action with a loading state that stays enabled while loading.
 *
 * - Bento only applies its high-contrast loading styles to enabled buttons and already ignores clicks while loading,
 *   so disabling a loading button greys out the loading indicator.
 * - Bento renders a different element when `state` is undefined, so an explicit `start` state keeps focus on the button
 *   when loading begins.
 *
 * Accessibility gap: the loading button is not disabled, and Bento hides its loading indicator from assistive
 * technology, so screen readers still announce it as an active button while its clicks are ignored.
 * TODO: Disable the button while loading once Bento keeps its loading colours on disabled loading buttons.
 */
export const getBentoLoadingActionState = (isLoading: boolean, disabled = false) => ({
    disabled: !isLoading && disabled,
    state: isLoading ? ('loading' as const) : ('start' as const),
});

export default getBentoLoadingActionState;
