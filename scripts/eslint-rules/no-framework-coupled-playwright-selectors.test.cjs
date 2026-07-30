const assert = require('node:assert/strict');
const test = require('node:test');
const { Linter } = require('eslint');
const rule = require('./no-framework-coupled-playwright-selectors.cjs');

const RULE_NAME = 'no-framework-coupled-playwright-selectors';
const DISALLOWED_SELECTOR_MESSAGE =
    'Avoid bare type selectors in Playwright selectors. Prefer accessible queries or stable data-testid hooks instead.';

const lint = code => {
    const linter = new Linter({ configType: 'eslintrc' });
    linter.defineRule(RULE_NAME, rule);

    return linter.verify(code, {
        parserOptions: {
            ecmaVersion: 2020,
            sourceType: 'module',
        },
        rules: {
            [RULE_NAME]: 'error',
        },
    });
};

test('reports bare type selectors, including custom elements', () => {
    const messages = lint("page.locator('div'); page.waitForSelector('button'); page.$$('payment-link-form');");

    assert.equal(messages.length, 3);
    assert.deepEqual(
        messages.map(({ message }) => message),
        Array.from({ length: 3 }, () => DISALLOWED_SELECTOR_MESSAGE)
    );
});

test('allows stable attribute-based selectors that are not bare elements', () => {
    const messages = lint('page.locator(\'[data-testid="component-root"]\'); page.locator(\'input[type="file"]\');');

    assert.deepEqual(messages, []);
});
