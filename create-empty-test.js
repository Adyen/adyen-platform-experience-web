import path from 'path';
import { writeFile, existsSync, readdir } from 'node:fs';

// const directoriesToScan = ['src/components/internal', 'src/hooks', 'src/core/Localization', 'src/primitives', 'src/utils'];
const directoriesToScan = ['src/components/utils'];

const testFileExtension = '.test.tsx'; // Adjust based on your project

directoriesToScan.forEach(directory => {
    scanDirectory(directory);
});

function scanDirectory(dir) {
    readdir(dir, { withFileTypes: true }, (err, files) => {
        if (err) return console.error(`Error reading directory ${dir}:`, err);

        files.forEach(file => {
            if (file.isDirectory()) {
                scanDirectory(path.join(dir, file.name));
            } else if (file.name.endsWith('.tsx') || (file.name.endsWith('.ts') && !file.name.includes('index'))) {
                const fileNameWithoutExt = file.name.replace(/\.(tsx|ts)$/, '');
                const testFileName = `${fileNameWithoutExt}${testFileExtension}`;
                const testFilePath = path.join(dir, testFileName);

                if (!existsSync(testFilePath)) {
                    writeFile(testFilePath, '', err => {
                        if (err) return console.error(`Error creating file ${testFilePath}:`, err);
                        console.log(`Created empty test file: ${testFilePath}`);
                    });
                }
            }
        });
    });
}
