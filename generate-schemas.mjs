import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const api_url = 'https://gitlab.is.adyen.com/api/v4/projects/1851/repository/tree?path=specs/platform-components&ref=main';
const headers = { 'PRIVATE-TOKEN': 'glpat-SQz55EseKLJ_jNiYDzRc' };

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const outputDir = join(__dirname, '/schemas');
const outputFileName = 'output.yaml';

if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
}
fetch(
    'https://gitlab.is.adyen.com/api/v4/projects/1851/repository/files/specs%2Fplatform-components%2FSetupResource%2FSetupResource-v1.yaml/raw?ref=main',
    { headers }
)
    .then(response => {
        if (response.ok) {
            return response.text();
        }
        throw new Error('Network response was not ok.');
    })
    .then(data => {
        console.log(data);

        const outputPath = join(outputDir, outputFileName);
        fs.writeFile(outputPath, data, 'utf8', err => {
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log(`File saved to ${outputPath}`);
            }
        });

        /* const filePaths = files.filter(file => file.type === 'tree').map(file => file.path);
        filePaths.forEach(file => {
            fetch(`https://gitlab.is.adyen.com/api/v4/projects/1851/repository/tree?path=${file}&ref=main`, { headers })
                .then(response => response.json())
                .then(files => {
                    fetch(
                        `https://gitlab.is.adyen.com/api/v4/projects/1851/repository/files/${files[1].path.replaceAll('/', '%2F')}/raw?ref=main`
                    ).then(res => console.log(res));
                });
        }); */
    })
    .catch(error => console.error('Error:', error));
