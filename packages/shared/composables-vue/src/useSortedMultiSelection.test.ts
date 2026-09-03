import { expect, test } from 'vitest';
import { sortMultiSelection, useSortedMultiSelection } from './useSortedMultiSelection';

test('sorts multi-select values consistently without mutating inputs', () => {
    const selectedValues = ['zebra', 'apple'];
    const selection = useSortedMultiSelection(selectedValues);

    expect(selection.selectedValues.value).toEqual(['apple', 'zebra']);
    expect(selectedValues).toEqual(['zebra', 'apple']);
    expect(sortMultiSelection(['beta', 'alpha'])).toEqual(['alpha', 'beta']);

    selection.setSelectedValues(['charlie', 'alpha']);
    expect(selection.selectedValues.value).toEqual(['alpha', 'charlie']);
});
