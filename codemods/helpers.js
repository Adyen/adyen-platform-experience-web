import jscodeshift from 'jscodeshift';

/**
 * Shared harness for the codemod tests. Not part of the shipped dist copy.
 *
 * Runs a codemod transform over `source` the same way the jscodeshift
 * runner would, and returns the (possibly unchanged) output, the notes
 * captured through api.report, and whether anything was mutated.
 */
export function runTransform(transform, source, options = {}) {
    const notes = [];
    const api = {
        jscodeshift: jscodeshift.withParser('tsx'),
        stats: () => {},
        report: msg => notes.push(msg),
    };
    const output = transform({ path: 'test.ts', source }, api, options);
    return { output: output ?? source, changed: output != null, notes };
}
