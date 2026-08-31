import type { TranslationTemplate, TranslationTemplateNode } from './types';

export class InvalidTranslationTemplateError extends Error {
    public readonly code = 'invalid_translation_template' as const;

    constructor(message: string) {
        super(message);
        this.name = 'InvalidTranslationTemplateError';
    }
}

const isPlaceholderCharacter = (character: string): boolean => {
    const code = character.charCodeAt(0);
    return (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || character === '_' || (code >= 97 && code <= 122);
};

export const parseV1TranslationTemplate = (source: string): TranslationTemplate => {
    const nodes: TranslationTemplateNode[] = [];
    const placeholders = new Set<string>();
    let text = '';
    let index = 0;

    const flushText = () => {
        if (!text) return;
        nodes.push({ type: 'text', value: text });
        text = '';
    };

    while (index < source.length) {
        if (source[index] !== '%' || source[index + 1] !== '{') {
            text += source[index];
            index++;
            continue;
        }

        flushText();
        const placeholderStart = index;
        index += 2;
        let name = '';

        while (index < source.length && source[index] !== '}') {
            const character = source[index]!;
            if (!isPlaceholderCharacter(character)) {
                throw new InvalidTranslationTemplateError(`Invalid placeholder at offset ${placeholderStart}.`);
            }
            name += character;
            index++;
        }

        if (!name || source[index] !== '}') {
            throw new InvalidTranslationTemplateError(`Unclosed or empty placeholder at offset ${placeholderStart}.`);
        }

        placeholders.add(name);
        nodes.push({ type: 'placeholder', name });
        index++;
    }

    flushText();

    return {
        nodes,
        placeholders: [...placeholders].sort(),
        source,
    };
};

export const formatV1TranslationTemplate = (
    template: TranslationTemplate,
    values?: Record<string, unknown> | ((placeholder: string, index: number, repetitionIndex: number) => unknown)
): string => {
    const repetitions = new Map<string, number>();
    let placeholderIndex = -1;

    return template.nodes
        .map(node => {
            if (node.type === 'text') return node.value;

            const repetitionIndex = (repetitions.get(node.name) ?? -1) + 1;
            repetitions.set(node.name, repetitionIndex);
            placeholderIndex++;

            const value = typeof values === 'function' ? values(node.name, placeholderIndex, repetitionIndex) : values?.[node.name];
            return value == null ? '' : String(value);
        })
        .join('');
};

export const haveMatchingPlaceholders = (left: string, right: string): boolean => {
    const leftPlaceholders = parseV1TranslationTemplate(left).placeholders;
    const rightPlaceholders = parseV1TranslationTemplate(right).placeholders;
    return (
        leftPlaceholders.length === rightPlaceholders.length &&
        leftPlaceholders.every((placeholder, index) => placeholder === rightPlaceholders[index])
    );
};
