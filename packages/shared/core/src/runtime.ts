type RuntimeWindow = Partial<Pick<Window, 'document' | 'location' | 'screen'>>;
type RuntimeNavigator = Partial<Pick<Navigator, 'userAgent'>>;
type RuntimeProcess = {
    env?: NodeJS.ProcessEnv;
};

const getRuntimeWindow = (): RuntimeWindow | undefined => (typeof window === 'undefined' ? undefined : window);

const getRuntimeNavigator = (): RuntimeNavigator | undefined => (typeof navigator === 'undefined' ? undefined : navigator);

const getRuntimeProcess = (): RuntimeProcess | undefined => (typeof process === 'undefined' ? undefined : process);

export const SERVER_SIDE_INITIALIZATION_WARNING =
    'Adyen Platform Experience Web does not support server-side rendering. Initialize components in the browser, or dynamically import them when using SSR.';

export const getUserAgent = (runtimeNavigator: RuntimeNavigator | undefined = getRuntimeNavigator()) => {
    return runtimeNavigator?.userAgent ?? '';
};

export const getCurrentUrl = (runtimeWindow: RuntimeWindow | undefined = getRuntimeWindow()) => {
    return runtimeWindow?.location?.href ?? '';
};

export const getScreenWidth = (runtimeWindow: RuntimeWindow | undefined = getRuntimeWindow()) => {
    return runtimeWindow?.screen?.width;
};

export const isServerSideRuntime = (runtimeWindow: RuntimeWindow | undefined = getRuntimeWindow()) => {
    return runtimeWindow === undefined || runtimeWindow.document === undefined;
};

export const shouldWarnAboutServerSideInitialization = ({
    runtimeWindow = getRuntimeWindow(),
    runtimeProcess = getRuntimeProcess(),
    mode,
}: {
    runtimeWindow?: RuntimeWindow;
    runtimeProcess?: RuntimeProcess;
    mode?: string;
} = {}) => {
    if (!isServerSideRuntime(runtimeWindow)) {
        return false;
    }

    const effectiveMode = mode ?? runtimeProcess?.env?.VITE_MODE;
    return runtimeProcess?.env?.NODE_ENV === 'development' || effectiveMode === 'development';
};
