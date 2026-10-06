import { expect } from '@playwright/test';

/**
 * Tag for the live smoke set: the only contract tests that run against the live environment, where data cannot be controlled.
 * The live job in `.github/workflows/contract-tests.yml` runs `--grep @live-smoke`; everything else runs in the test environment only.
 */
export const LIVE_SMOKE_TAG = '@live-smoke';

const kindOf = (value: unknown) => (value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value);

/**
 * Compares the structure of a response with a template whose values are placeholders.
 * Every template field must exist with the same kind; array items are checked against the first template item.
 * Values and extra fields are ignored.
 */
export const structureMismatches = (actual: unknown, template: unknown, path = '$'): string[] => {
    const expected = kindOf(template);
    const received = kindOf(actual);

    if (actual === undefined) return [`${path}: missing`];
    if (expected !== received) return [`${path}: expected ${expected}, received ${received}`];

    if (Array.isArray(template) && Array.isArray(actual)) {
        const [itemTemplate] = template;
        return itemTemplate === undefined ? [] : actual.flatMap((item, index) => structureMismatches(item, itemTemplate, `${path}[${index}]`));
    }

    if (expected === 'object') {
        const record = actual as Record<string, unknown>;
        return Object.entries(template as Record<string, unknown>).flatMap(([key, value]) =>
            structureMismatches(record[key], value, `${path}.${key}`)
        );
    }

    return [];
};

export const expectStructure = (actual: unknown, template: unknown) => {
    expect(structureMismatches(actual, template), 'response structure differs from the expected contract').toEqual([]);
};

export const expectNonEmpty = <T>(items: T[] | undefined, what: string): [T, ...T[]] => {
    expect(items?.length ?? 0, `no ${what} found, so the contract cannot be checked`).toBeGreaterThan(0);
    return items as [T, ...T[]];
};

export const recentDateRange = (days: number, now = Date.now()) => ({
    createdSince: new Date(now - days * 24 * 60 * 60 * 1000).toISOString(),
    createdUntil: new Date(now).toISOString(),
});
