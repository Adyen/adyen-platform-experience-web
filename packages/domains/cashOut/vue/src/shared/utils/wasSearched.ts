/**
 * Whether the option of a searchable dropdown was chosen from a search: its field still holds what was typed when the option is chosen,
 * rather than nothing or what was selected before.
 */
const SEARCH_FIELD = 'input[role="combobox"]';

export const wasSearched = (root: Element | null | undefined, previousLabel: string | undefined) => {
    // The $el of a component that renders a fragment is a text or a comment node, which can't be searched
    if (!(root instanceof Element)) return false;
    const field = root.matches(SEARCH_FIELD) ? (root as HTMLInputElement) : root.querySelector<HTMLInputElement>(SEARCH_FIELD);
    const query = field?.value.trim() ?? '';
    return query !== '' && query !== (previousLabel ?? '');
};
