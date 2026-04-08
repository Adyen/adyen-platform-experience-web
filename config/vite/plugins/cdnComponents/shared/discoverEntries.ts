import { resolve } from 'node:path';
import { readdirSync, existsSync } from 'node:fs';

/**
 * Auto-discover CDN component entry points by scanning `componentsDir`
 * for subdirectories that contain an `index.ts` file.
 */
export const discoverEntries = (componentsDir: string): Record<string, string> => {
    const entries: Record<string, string> = {};

    if (!existsSync(componentsDir)) {
        return entries;
    }

    for (const dir of readdirSync(componentsDir, { withFileTypes: true })) {
        if (dir.isDirectory()) {
            const indexPath = resolve(componentsDir, dir.name, 'index.ts');

            if (existsSync(indexPath)) {
                entries[dir.name] = indexPath;
            }
        }
    }

    return entries;
};
