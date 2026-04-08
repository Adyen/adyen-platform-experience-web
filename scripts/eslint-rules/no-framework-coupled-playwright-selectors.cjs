const SELECTOR_METHODS = new Set(['locator', 'waitForSelector', '$', '$$']);
const BARE_TYPE_SELECTOR_REGEX = /^[a-z][a-z0-9-]*$/i;

const DISALLOWED_PATTERNS = [
    {
        label: 'internal CSS class selectors',
        regex: /\.adyen-pe-/,
    },
    {
        label: 'XPath selectors',
        regex: /xpath=/,
    },
    {
        label: 'bare type selectors',
        regex: BARE_TYPE_SELECTOR_REGEX,
    },
    {
        label: 'aria-labelledby attribute selectors',
        regex: /\[aria-labelledby=/,
    },
    {
        label: 'name attribute selectors for inputs',
        regex: /input\[name=/,
    },
    {
        label: 'name attribute selectors for divs',
        regex: /div\[name=/,
    },
    {
        label: 'title attribute selectors for buttons',
        regex: /button\[title=/,
    },
];

const getSelectorMethodName = callee => {
    if (callee?.type !== 'MemberExpression' || callee.computed) {
        return undefined;
    }

    return callee.property.type === 'Identifier' ? callee.property.name : undefined;
};

const getStaticStringValue = node => {
    if (!node) {
        return undefined;
    }

    if (node.type === 'Literal' && typeof node.value === 'string') {
        return node.value;
    }

    if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
        return node.quasis[0]?.value.cooked;
    }

    return undefined;
};

const findViolation = selectorValue => DISALLOWED_PATTERNS.find(({ regex }) => regex.test(selectorValue));

module.exports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow framework-coupled Playwright selectors in tests',
        },
        schema: [],
        messages: {
            disallowedSelector: 'Avoid {{label}} in Playwright selectors. Prefer accessible queries or stable data-testid hooks instead.',
        },
    },
    create(context) {
        return {
            CallExpression(node) {
                const methodName = getSelectorMethodName(node.callee);

                if (!SELECTOR_METHODS.has(methodName)) {
                    return;
                }

                const selectorValue = getStaticStringValue(node.arguments[0]);

                if (!selectorValue) {
                    return;
                }

                const violation = findViolation(selectorValue);

                if (!violation) {
                    return;
                }

                context.report({
                    node: node.arguments[0],
                    messageId: 'disallowedSelector',
                    data: {
                        label: violation.label,
                    },
                });
            },
        };
    },
};
