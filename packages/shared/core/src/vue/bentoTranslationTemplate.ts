type TemplateNode = { type: 'text'; value: string } | { type: 'placeholder'; name: string };
type PlaceholderType = 'bento' | 'sdk';

export type BentoTranslationFamily = Readonly<{
    base: string | null;
    zero: string | null;
    one: string | null;
    plural: string | null;
    unsupportedExactCounts: number[];
}>;

export class InvalidBentoTranslationTemplateError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidBentoTranslationTemplateError';
    }
}

const isPlaceholderCharacter = (character: string): boolean => /^[A-Za-z0-9_]$/.test(character);

const parseTemplate = (source: string, allowedPlaceholderTypes: ReadonlySet<PlaceholderType>): TemplateNode[] => {
    const nodes: TemplateNode[] = [];
    let text = '';
    let index = 0;
    let placeholderType: PlaceholderType | undefined;

    const flushText = () => {
        if (!text) return;
        nodes.push({ type: 'text', value: text });
        text = '';
    };

    while (index < source.length) {
        const startsSdkPlaceholder = source[index] === '%' && source[index + 1] === '{';
        const startsBentoPlaceholder = source[index] === '{';

        if (!startsSdkPlaceholder && !startsBentoPlaceholder) {
            text += source[index];
            index++;
            continue;
        }

        const currentPlaceholderType = startsSdkPlaceholder ? 'sdk' : 'bento';

        if (!allowedPlaceholderTypes.has(currentPlaceholderType) || (placeholderType && placeholderType !== currentPlaceholderType)) {
            throw new InvalidBentoTranslationTemplateError(`Mixed or unsupported placeholder type at offset ${index}.`);
        }

        placeholderType = currentPlaceholderType;
        flushText();

        const placeholderStart = index;
        index += startsSdkPlaceholder ? 2 : 1;
        let name = '';

        while (index < source.length && source[index] !== '}') {
            const character = source[index]!;
            if (!isPlaceholderCharacter(character)) {
                throw new InvalidBentoTranslationTemplateError(`Invalid placeholder at offset ${placeholderStart}.`);
            }
            name += character;
            index++;
        }

        if (!name || source[index] !== '}') {
            throw new InvalidBentoTranslationTemplateError(`Unclosed or empty placeholder at offset ${placeholderStart}.`);
        }

        nodes.push({ type: 'placeholder', name });
        index++;
    }

    flushText();
    return nodes;
};

const getPlaceholders = (nodes: TemplateNode[]): string[] =>
    [...new Set(nodes.flatMap(node => (node.type === 'placeholder' ? [node.name] : [])))].sort();

const hasCompatiblePlaceholders = (source: TemplateNode[], target: TemplateNode[]): boolean => {
    const sourcePlaceholders = getPlaceholders(source);
    const targetPlaceholders = new Set(getPlaceholders(target));

    // Bento may provide a value, such as `count`, that an exact-count branch
    // does not need. A domain template must not require a value Bento does not
    // provide, but it may safely omit provided values.
    return sourcePlaceholders.every(placeholder => targetPlaceholders.has(placeholder));
};

const compileForBento = (nodes: TemplateNode[]): string => nodes.map(node => (node.type === 'text' ? node.value : `{${node.name}}`)).join('');

/**
 * SDK translations use `%{name}` placeholders while Bento uses Vue I18n's
 * `{name}` placeholders. Each template must use one syntax consistently.
 */
export const compileBentoTemplate = (source: string): string => compileForBento(parseTemplate(source, new Set(['sdk', 'bento'])));

export const compileDomainTemplateForBento = (domainTemplate: string, bentoTemplate: string): string | null => {
    const domainNodes = parseTemplate(domainTemplate, new Set(['sdk']));
    const bentoNodes = parseTemplate(bentoTemplate, new Set(['sdk', 'bento']));
    return hasCompatiblePlaceholders(domainNodes, bentoNodes) ? compileForBento(domainNodes) : null;
};

/**
 * Bento's default three-choice plural rule addresses zero, one, and two or
 * more. Exact counts above one therefore use the general plural template when
 * available; their count-specific wording is intentionally not carried over.
 * Without a general plural template, the SDK/Bento fallback is safer.
 */
export const compileDomainTranslationFamilyForBento = (family: BentoTranslationFamily, bentoTemplate: string): string | null => {
    if (!family.base || (family.unsupportedExactCounts.length > 0 && !family.plural)) return null;

    const hasPluralVariants = family.zero !== null || family.one !== null || family.plural !== null;
    if (!hasPluralVariants) return compileDomainTemplateForBento(family.base, bentoTemplate);

    const templates = [family.zero ?? family.base, family.one ?? family.base, family.plural ?? family.base];
    const compiledTemplates = templates.map(template => compileDomainTemplateForBento(template, bentoTemplate));

    return compiledTemplates.some(template => template === null) ? null : compiledTemplates.join(' | ');
};
