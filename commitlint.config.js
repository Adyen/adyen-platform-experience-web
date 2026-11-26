export default {
    extends: ['@commitlint/config-conventional'],
    ignores: [message => /^Bump v\d+\.\d+\.\d+/.test(message)],
};
