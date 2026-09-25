import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import type { FullConfig, Reporter, Suite, TestCase } from '@playwright/test/reporter';
import { STORY_ANNOTATION } from './storyCoverage';

export type StoryVisit = { storyId: string; outcome: ReturnType<TestCase['outcome']>; file: string };
export type StoryRun = { testFiles: string[]; visits: StoryVisit[] };

export const collectStoryRun = (tests: TestCase[], rootDir: string): StoryRun => ({
    testFiles: [...new Set(tests.map(test => relative(rootDir, test.location.file)))].sort(),
    visits: tests.flatMap(test => {
        const annotations = [...test.annotations, ...test.results.flatMap(result => result.annotations)];
        const storyIds = new Set(annotations.filter(({ type, description }) => type === STORY_ANNOTATION && description).map(a => a.description!));
        const file = relative(rootDir, test.location.file);
        return [...storyIds].map(storyId => ({ storyId, outcome: test.outcome(), file }));
    }),
});

/**
 * Writes the spec files in this run and the stories opened by each test (with the test's final outcome) to
 * `<outputDir>/visited[-<shard>].json`. `scripts/story-coverage/report.mjs` merges these files and compares them
 * with the Storybook index; domains without spec files in the run are reported as not run.
 */
export default class StoryCoverageReporter implements Reporter {
    private config?: FullConfig;
    private suite?: Suite;
    private readonly outputDir: string;

    constructor({ outputDir = 'story-coverage' }: { outputDir?: string } = {}) {
        this.outputDir = outputDir;
    }

    onBegin(config: FullConfig, suite: Suite) {
        this.config = config;
        this.suite = suite;
    }

    onEnd() {
        if (!this.config || !this.suite) return;
        const { configFile, shard } = this.config;
        const rootDir = configFile ? dirname(configFile) : process.cwd();
        const storyRun = collectStoryRun(this.suite.allTests(), rootDir);
        // Runs without stories (e.g. the contract project) must not overwrite integration results.
        if (!storyRun.visits.length) return;
        const outputDir = resolve(rootDir, this.outputDir);
        const fileName = shard ? `visited-${shard.current}-of-${shard.total}.json` : 'visited.json';
        mkdirSync(outputDir, { recursive: true });
        writeFileSync(join(outputDir, fileName), `${JSON.stringify(storyRun, null, 2)}\n`);
    }

    printsToStdio() {
        return false;
    }
}
