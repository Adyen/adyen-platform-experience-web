import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Auto-discover available icons from the filesystem.
 * Scans the icons directory and builds a map of icon names to file names.
 *
 * @param iconsDir - Path to the icons directory
 * @param pluginName - Plugin name for logging
 * @returns Record mapping icon names to file names
 */
export const discoverIcons = (iconsDir: string, pluginName: string): Record<string, string> => {
    try {
        const iconsPath = resolve(process.cwd(), iconsDir);
        const files = readdirSync(iconsPath);

        const iconMap: Record<string, string> = {};

        files.forEach(file => {
            // Match .svg files
            if (file.endsWith('.svg')) {
                const iconName = file.replace('.svg', '');
                iconMap[iconName] = iconName;
            }
        });

        return iconMap;
    } catch (err) {
        console.warn(`[${pluginName}] Could not read icons directory: ${iconsDir}`);
        return {};
    }
};
