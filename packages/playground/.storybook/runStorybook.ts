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
    port: 6006,
}).catch(console.error);
