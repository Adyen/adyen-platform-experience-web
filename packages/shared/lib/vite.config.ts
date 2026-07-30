import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPreactViteLibConfig } from '../../../config/preact-vite-lib.config';

const projectRoot = resolve(fileURLToPath(import.meta.url), '..');

export default getPreactViteLibConfig({
    projectRoot,
    entry: 'src/index.ts',
    scssLoadPaths: [resolve(projectRoot, '../../../src')],
});
