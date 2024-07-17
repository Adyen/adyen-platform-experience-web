import { buildDevStandalone } from '@storybook/core-server';
import packageJson from '../package.json';
import { PackageJson } from '@storybook/types';

const STORYBOOK_DIR = __dirname;

buildDevStandalone({
    configDir: STORYBOOK_DIR,
    packageJson: packageJson as PackageJson,
    port: process.env.VITE_PLAYGROUND_PORT ? Number(process.env.VITE_PLAYGROUND_PORT) : 6006,
}).catch(console.error);
