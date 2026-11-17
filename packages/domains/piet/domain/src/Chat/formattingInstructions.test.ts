import { expect, test } from 'vitest';
import { PIET_FORMATTING_INSTRUCTIONS } from './formattingInstructions';

test('asks for tables for numeric data, with decimal amounts and currency', () => {
    expect(PIET_FORMATTING_INSTRUCTIONS).toContain('markdown table instead of a bullet list');
    expect(PIET_FORMATTING_INSTRUCTIONS).toContain('never as minor units');
});
