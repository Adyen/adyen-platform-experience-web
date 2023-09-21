import { buildDevStandalone } from '@storybook/core-server';
import packageJson from '../package.json';
import { BuilderOptions, CLIOptions, LoadOptions, PackageJson } from '@storybook/types';

const STORYBOOK_DIR = __dirname;

export const baseOptions: CLIOptions & LoadOptions & BuilderOptions = {
    configDir: STORYBOOK_DIR,
    packageJson: packageJson as PackageJson,
};

buildDevStandalone({
    ...baseOptions,
    port: process.env.VITE_PLAYGROUND_PORT ? Number(process.env.VITE_PLAYGROUND_PORT) : 6060,
}).catch(console.error);
