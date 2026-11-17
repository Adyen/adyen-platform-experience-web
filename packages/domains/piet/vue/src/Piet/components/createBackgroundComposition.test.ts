import { describe, expect, test } from 'vitest';
import { createBackgroundComposition } from './createBackgroundComposition';

/** Small seeded generator, so the compositions in these tests are repeatable. */
const seeded = (seed: number) => () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const seeds = Array.from({ length: 200 }, (_, index) => index + 1);

describe('createBackgroundComposition', () => {
    test.each(seeds)('seed %i: the blocks tile the canvas without overlap or gaps', seed => {
        const { cells } = createBackgroundComposition(seeded(seed));

        expect(cells.reduce((area, { width, height }) => area + width * height, 0)).toBeCloseTo(10000, 5);
        cells.forEach(({ x, y, width, height }) => {
            expect(x).toBeGreaterThanOrEqual(0);
            expect(y).toBeGreaterThanOrEqual(0);
            expect(x + width).toBeLessThanOrEqual(100 + 1e-9);
            expect(y + height).toBeLessThanOrEqual(100 + 1e-9);
        });
    });

    test.each(seeds)('seed %i: blocks are big enough, and the title block stays paper', seed => {
        const { cells } = createBackgroundComposition(seeded(seed));

        expect(cells[0]).toMatchObject({ x: 0, y: 0, tone: 'paper' });
        cells.forEach(({ width, height }) => {
            expect(width).toBeGreaterThanOrEqual(10);
            expect(height).toBeGreaterThanOrEqual(10);
        });
    });

    test.each(seeds)('seed %i: uses a few accents, with at most one deep and one medium block', seed => {
        const { cells } = createBackgroundComposition(seeded(seed));
        const count = (tone: string) => cells.filter(cell => cell.tone === tone).length;

        expect(cells.filter(({ tone }) => tone !== 'paper').length).toBeGreaterThanOrEqual(1);
        expect(count('deep')).toBeLessThanOrEqual(1);
        expect(count('medium')).toBeLessThanOrEqual(1);
    });

    test('draws one line per cut between the blocks', () => {
        const { cells, lines } = createBackgroundComposition(seeded(7));
        const columns = lines.filter(({ orientation }) => orientation === 'vertical').length + 1;
        const rows = lines.filter(({ orientation }) => orientation === 'horizontal').length + 1;

        expect(cells).toHaveLength(columns * rows);
    });

    test('is different every time with the default random source, and repeatable with a seed', () => {
        const compositions = new Set(Array.from({ length: 10 }, () => JSON.stringify(createBackgroundComposition())));

        expect(compositions.size).toBeGreaterThan(1);
        expect(createBackgroundComposition(seeded(3))).toEqual(createBackgroundComposition(seeded(3)));
    });
});
