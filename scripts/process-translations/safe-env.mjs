// Child processes run in a fully pinned environment: the only PATH they see is a literal list of
// fixed, unwriteable system directories, and nothing is inherited from process.env, so neither a
// substituted binary nor variables such as GIT_* can influence the child. Windows has no fixed
// binary locations and cannot load node without SystemRoot (needed for the system DLLs), so there
// the inherited SystemRoot and PATH are passed through instead.
export const SAFE_ENV = process.platform === 'win32' ? { SystemRoot: process.env.SystemRoot, PATH: process.env.PATH } : { PATH: '/usr/bin:/bin' };

// Git is invoked through its absolute system path on POSIX, so the binary is never resolved via
// PATH; Windows has no fixed location, so there it is resolved through the inherited PATH.
export const GIT_BIN = process.platform === 'win32' ? 'git' : '/usr/bin/git';
