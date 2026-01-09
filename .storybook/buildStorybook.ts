import { resolve } from 'node:path';
import packageJson from '../package.json';
import { buildStaticStandalone } from 'storybook/internal/core-server';

const STORYBOOK_DIR = __dirname;

buildStaticStandalone({
    configDir: STORYBOOK_DIR,
    packageJson: packageJson as any,
    outputDir: resolve(STORYBOOK_DIR, '../storybook-static'),
}).catch(console.error);
