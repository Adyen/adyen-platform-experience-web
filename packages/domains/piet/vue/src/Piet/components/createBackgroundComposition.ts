export type BackgroundTone = 'paper' | 'mist' | 'sage' | 'light' | 'medium' | 'deep';

export interface BackgroundCell {
    x: number;
    y: number;
    width: number;
    height: number;
    tone: BackgroundTone;
}

export interface BackgroundLine {
    /** `vertical` lines run top to bottom at `position` on the x axis, `horizontal` ones left to right on the y axis. */
    orientation: 'vertical' | 'horizontal';
    position: number;
}

export interface BackgroundComposition {
    cells: BackgroundCell[];
    lines: BackgroundLine[];
}

/** The artwork is drawn on a 100 x 100 canvas. */
const SIZE = 100;
const MIN_GAP = 12;

/** Where each dividing line may fall. Together they keep every block big enough to read as a block. */
const VERTICAL_RANGES: ReadonlyArray<readonly [number, number]> = [
    [14, 30],
    [38, 58],
    [66, 86],
];
const HORIZONTAL_RANGES: ReadonlyArray<readonly [number, number]> = [
    [14, 26],
    [42, 62],
    [72, 90],
];

/** Colored tones, and how many blocks of each at most. Everything else stays paper, as in a Mondrian painting. */
const ACCENTS: ReadonlyArray<readonly [Exclude<BackgroundTone, 'paper'>, number]> = [
    ['deep', 1],
    ['medium', 1],
    ['light', 2],
    ['sage', 2],
    ['mist', 2],
];

const shuffle = <T>(items: readonly T[], random: () => number) => {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
        const other = Math.floor(random() * (index + 1));
        [result[index], result[other]] = [result[other]!, result[index]!];
    }
    return result;
};

const pickCuts = (ranges: ReadonlyArray<readonly [number, number]>, random: () => number) => {
    // Two or three lines per direction, never closer than MIN_GAP to each other.
    const count = random() < 0.5 ? 2 : 3;
    const cuts: number[] = [];

    for (const [from, to] of shuffle(ranges, random).slice(0, count)) {
        const cut = Math.round((from + random() * (to - from)) * 10) / 10;
        if (cuts.every(existing => Math.abs(existing - cut) >= MIN_GAP)) cuts.push(cut);
    }

    return cuts.sort((a, b) => a - b);
};

/**
 * Draws a new minimalist composition: a handful of vertical and horizontal lines divide the canvas into blocks, and a few
 * of the blocks get a shade of green. The top-left block always stays paper, because the component's title sits on it.
 *
 * @param random A function returning numbers in [0, 1), `Math.random` by default. Injectable to make results repeatable.
 */
export const createBackgroundComposition = (random: () => number = Math.random): BackgroundComposition => {
    const columns = pickCuts(VERTICAL_RANGES, random);
    const rows = pickCuts(HORIZONTAL_RANGES, random);
    const xs = [0, ...columns, SIZE];
    const ys = [0, ...rows, SIZE];

    const cells: BackgroundCell[] = [];
    for (let row = 0; row < ys.length - 1; row++) {
        for (let column = 0; column < xs.length - 1; column++) {
            cells.push({ x: xs[column]!, y: ys[row]!, width: xs[column + 1]! - xs[column]!, height: ys[row + 1]! - ys[row]!, tone: 'paper' });
        }
    }

    // Spread the accents over randomly chosen blocks, skipping the top-left one.
    const candidates = shuffle(cells.slice(1), random);
    const accents = shuffle(
        ACCENTS.flatMap(([tone, max]) => Array.from({ length: max }, () => tone)),
        random
    ).slice(0, Math.min(candidates.length, 3 + Math.floor(random() * 3)));

    accents.forEach((tone, index) => (candidates[index]!.tone = tone));

    return {
        cells,
        lines: [
            ...columns.map(position => ({ orientation: 'vertical' as const, position })),
            ...rows.map(position => ({ orientation: 'horizontal' as const, position })),
        ],
    };
};
