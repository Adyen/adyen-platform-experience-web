import { getBaseEnvDefines } from './base-env';
import version from '../version';

export const getBuildEnvDefines = (mode: string) => {
    const { BUILD_ID, COMMIT_BRANCH, COMMIT_HASH } = version();

    return {
        ...getBaseEnvDefines(mode),
        'process.env.VITE_BUILD_ID': JSON.stringify(BUILD_ID),
        'process.env.VITE_COMMIT_BRANCH': JSON.stringify(COMMIT_BRANCH),
        'process.env.VITE_COMMIT_HASH': JSON.stringify(COMMIT_HASH),
    };
};
