import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getViteLibConfig } from '../../../config/vite-lib.config';

const projectRoot = resolve(fileURLToPath(import.meta.url), '..');

export default getViteLibConfig({
    projectRoot,
    entry: 'src/index.ts',
    scssLoadPaths: [resolve(projectRoot, '../../../src')],
});
