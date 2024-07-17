import { buildStaticStandalone } from '@storybook/core-server';
import { resolve } from 'node:path';
import packageJson from '../package.json';
import { PackageJson } from '@storybook/types';

const STORYBOOK_DIR = __dirname;

buildStaticStandalone({
    configDir: STORYBOOK_DIR,
    packageJson: packageJson as PackageJson,
    outputDir: resolve(STORYBOOK_DIR, '..', 'storybook-static'),
}).catch(console.error);
