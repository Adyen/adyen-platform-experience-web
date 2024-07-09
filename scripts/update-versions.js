const fs = require('fs');
const path = require('path');

const newVersion = process.argv[2];

if (!newVersion) {
    console.error('No version provided');
    process.exit(1);
}

const files = ['package.json', 'packages/lib/package.json'];

files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Updated ${file} to version ${newVersion}`);
});
