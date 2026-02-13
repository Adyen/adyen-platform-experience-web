// eslint-disable-next-line @typescript-eslint/no-require-imports
const { exec } = require('node:child_process');

module.exports = {
  hooks: {
    afterAllResolved(lockfile) {
      const pnpmLock = structuredClone(lockfile);
      Object.values(pnpmLock.packages).forEach((pkg) => {
        if (pkg.resolution) {
          delete pkg.resolution.integrity;
          delete pkg.resolution.tarball;
        }
      });

      // Clean-up yaml
      exec('pnpm prettier pnpm-lock.yaml --write');

      return pnpmLock;
    },
  },
};
