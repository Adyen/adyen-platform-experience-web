import childProcess from 'child_process';
import packageJson from '../../../package.json';
import { uuid } from '../src/utils';

const currentVersion = () => {
    let COMMIT_HASH = null;
    let COMMIT_BRANCH = null;
    const ADYEN_BUILD_ID = `@adyen/adyen-pe-web-${uuid()}`;

    try {
        COMMIT_HASH = childProcess.execSync('git rev-parse --short HEAD').toString().trim();
        COMMIT_BRANCH = childProcess.execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

        console.log(`Building version ${packageJson.version} (revision ${COMMIT_HASH} from branch ${COMMIT_BRANCH}). Build id ${ADYEN_BUILD_ID}`);
    } catch (e) {
        console.warn(e.message);
    }

    return {
        ADYEN_FP_VERSION: packageJson.version,
        COMMIT_BRANCH,
        COMMIT_HASH,
        ADYEN_BUILD_ID,
    };
};

export default currentVersion;
