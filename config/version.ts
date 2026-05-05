import childProcess from 'child_process';
import packageJson from '../package.json' with { type: 'json' };
import { uuid } from '../packages/shared/utils/src/random/uuid';

export const SDK_VERSION = packageJson.version;

const currentVersion = () => {
    const BUILD_ID = `@adyen/adyen-pe-web-${uuid()}`;
    let COMMIT_HASH = null;
    let COMMIT_BRANCH = null;

    try {
        COMMIT_HASH = childProcess.execSync('git rev-parse --short HEAD').toString().trim();
        COMMIT_BRANCH = childProcess.execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

        console.log(`Building version ${SDK_VERSION} (revision ${COMMIT_HASH} from branch ${COMMIT_BRANCH}). Build id ${BUILD_ID}`);
    } catch (e: any) {
        console.warn(e.message);
    }

    return {
        BUILD_ID,
        COMMIT_BRANCH,
        COMMIT_HASH,
        SDK_VERSION,
    };
};

export default currentVersion;
