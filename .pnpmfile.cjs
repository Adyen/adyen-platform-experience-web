// eslint-disable-next-line @typescript-eslint/no-require-imports
const { exec } = require('node:child_process');

module.exports = {
  hooks: {
    afterAllResolved(lockfile) {
      const pnpmLock = structuredClone(lockfile);
      for (const packagePath in pnpmLock.packages) {
        delete pnpmLock.packages[packagePath]?.resolution?.integrity;
        delete pnpmLock.packages[packagePath]?.resolution?.tarball;
      }

      // Clean-up yaml
      exec('pnpm prettier pnpm-lock.yaml --write');

      return pnpmLock;
    },
  },
};
