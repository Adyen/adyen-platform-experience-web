import type { CompiledTranslationFamily, ParsedTranslationFamilyKey, TranslationFamily, TranslationTargetFormat, TranslationTemplate } from './types';
import { InvalidTranslationTemplateError, parseV1TranslationTemplate } from './template';

export { formatV1TranslationTemplate, haveMatchingPlaceholders, InvalidTranslationTemplateError, parseV1TranslationTemplate } from './template';

export const compileTranslationTemplate = (template: TranslationTemplate, format: TranslationTargetFormat): string => {
    return template.nodes
        .map(node => {
            if (node.type === 'text') return node.value;
            return format === 'bento' ? `{${node.name}}` : `%{${node.name}}`;
        })
        .join('');
};

export const parseTranslationFamilyKey = (key: string): ParsedTranslationFamilyKey => {
    const separatorIndex = key.lastIndexOf('__');
    if (separatorIndex < 0) return { baseKey: key, variant: { type: 'base' } };

    const suffix = key.slice(separatorIndex + 2);
    const baseKey = key.slice(0, separatorIndex);

    if (!baseKey || !suffix) return { baseKey: key, variant: { type: 'base' } };
    if (suffix === 'plural') return { baseKey, variant: { type: 'plural' } };

    for (const character of suffix) {
        const code = character.charCodeAt(0);
        if (code < 48 || code > 57) return { baseKey: key, variant: { type: 'base' } };
    }

    return { baseKey, variant: { type: 'exact', count: Number(suffix) } };
};

const compileV1Family = (family: TranslationFamily): TranslationFamily => {
    const compile = (source: string | undefined) =>
        source === undefined ? undefined : compileTranslationTemplate(parseV1TranslationTemplate(source), 'v1');
    const exact = Object.entries(family.exact ?? {}).reduce<Record<number, string>>((compiled, [count, source]) => {
        compiled[Number(count)] = compile(source)!;
        return compiled;
    }, {});

    return {
        ...(family.base !== undefined && { base: compile(family.base) }),
        ...(family.plural !== undefined && { plural: compile(family.plural) }),
        ...(family.exact !== undefined && { exact }),
    };
};

export const compileTranslationFamily = (family: TranslationFamily, format: TranslationTargetFormat): CompiledTranslationFamily => {
    if (format === 'v1') return { format, templates: compileV1Family(family) };

    if (family.base === undefined || family.plural !== undefined || Object.keys(family.exact ?? {}).length > 0) {
        throw new InvalidTranslationTemplateError(
            'The V1 exact-count and greater-than-one plural semantics cannot be represented losslessly by the Bento target.'
        );
    }

    return {
        format,
        template: compileTranslationTemplate(parseV1TranslationTemplate(family.base), format),
    };
};
