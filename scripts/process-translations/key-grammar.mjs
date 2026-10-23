// The translation key grammar, stated once for every consumer that enforces it:
// the keyspace lint (domain catalogs, via `translations:grammar`) and the
// reference gate's domain-relative check (Bento route targets and the other
// reserved names, via `translations:keys`).
//
// The production, written for a key relative to its owning domain — the only
// form both consumers share, because a catalog key drops its `<domain>.`
// prefix, a route target is already relative, and the runtime adds the prefix
// back through `getDomainTranslationKey`:
//
//   <scope>[.<group>]*.<element>[.<role>]
//
//   scope    `common` for copy shared across a domain's features, otherwise
//            the feature that owns the copy (overview, details, creation…).
//   group    a UI region or data family that holds sibling copy.
//   element  the thing the copy names.
//   role     what the copy is for the element, drawn from ROLE_WORDS.
//
// The rules below are what makes that production checkable. Two of them are
// keyspace-wide rather than per-key (a key may not be a prefix of another, and
// a camel suffix may not do a segment's job), so they live in
// `keyspaceViolations` and run over a whole catalog.

export const MAX_KEY_DEPTH = 6;

/**
 * Words reserved for grouping siblings. They are always plural and never the
 * last segment: a group exists to hold elements, so a key that ends in one
 * names a container rather than copy.
 */
export const GROUP_WORDS = new Set([
    'actions',
    'alerts',
    'columns',
    'errors',
    'fields',
    'filters',
    'formats',
    'instructions',
    'options',
    'requirements',
    'restrictions',
    'sections',
    'states',
    'statuses',
    'steps',
    'tabs',
    'tags',
    'types',
    'values',
    'views',
]);

/**
 * Singular spellings of the group words. They read as an element but behave as
 * a group, which is how `creation.alert.invalidFields` and
 * `settings.action.save` drifted apart from their plural siblings.
 */
export const SINGULAR_GROUP_WORDS = new Map(
    [...GROUP_WORDS].flatMap(plural => {
        if (plural === 'statuses') return [['status', plural]];
        if (plural === 'types') return [['type', plural]];
        if (plural === 'values') return [['value', plural]];
        return [[plural.replace(/s$/, ''), plural]];
    })
);

/**
 * Words reserved for what a piece of copy is, rather than what it names. They
 * terminate a key, so that every leaf either carries a content name or says
 * which role it plays for its element.
 */
export const ROLE_WORDS = new Set(['a11yLabel', 'description', 'info', 'label', 'message', 'placeholder', 'subtitle', 'supportText', 'title']);

/**
 * Camel suffixes that restate a role word. A leaf may end in one only when no
 * sibling shares its base — otherwise the suffix is discriminating between
 * siblings, which is a segment's job (see `keyspaceViolations`). `Label`,
 * `Title` and `Description` are ordinary English and do appear inside genuine
 * content names ("Account description", "Merchandise Description"), so the
 * sibling is what tells the two apart.
 */
const ROLE_SUFFIXES = [...ROLE_WORDS]
    .map(role => role[0].toUpperCase() + role.slice(1))
    .concat(['Error', 'Success', 'InProgress', 'Loading', 'Done', 'Tab', 'Information']);
const roleSuffixPattern = new RegExp(`^(?<base>.*[a-z0-9])(?<suffix>${ROLE_SUFFIXES.join('|')})$`);

/**
 * Suffixes whose role segment is not simply the suffix in lowerCamelCase.
 * `Information` is the `info` role written out in full, so
 * `surchargeInformation` beside `surcharge` has to be sent to
 * `surcharge.info` rather than to the `surcharge.information` a plain
 * lowercasing would suggest — `information` is not a role word.
 */
const SUFFIX_ROLE_SEGMENTS = new Map([['Information', 'info']]);

/**
 * Camel suffixes that can only ever be structure. Unlike `Label` and friends
 * these never occur inside a content name, so they are a violation on sight:
 * the structure they name belongs in a segment.
 */
const STRUCTURAL_SUFFIXES = ['A11yLabel', 'AriaLabel', 'SupportText', 'Placeholder', 'Tab'];
const structuralSuffixPattern = new RegExp(`^(?<base>.*[a-z0-9])(?<suffix>${STRUCTURAL_SUFFIXES.join('|')})$`);

/**
 * A segment ending in `Errors` is an `errors` group that was folded into its
 * parent's name to save a level: `amountErrors.excess` is the `errors` group
 * of `amount`, and `paymentPspReferenceErrors.invalidLength` is the same
 * shape. `Errors` is the only group word safe to check this way — the others
 * end legitimate compound nouns the domains own (`fraudAlerts`, `linkTypes`,
 * `documentRequirements`, `refundedStates`), and those are group names in
 * their own right, not folded structure.
 */
const foldedGroupPattern = /^(?<base>.*[a-z0-9])(?<group>Errors)$/;

/**
 * Absolute base paths whose leaves mirror an API or configuration identifier
 * verbatim. Their casing is load-bearing — the runtime assembles the key as
 * `prefix + id` — so they are exempt from the casing rule and from the
 * sibling-suffix rule. The registry is explicit on purpose: an enum mirror is
 * a deliberate choice, not something a linter should infer from a capital
 * letter.
 *
 * Every `createKeyFactory` prefix belongs here, whether or not its leaves
 * happen to be capitalised today. The next enum value the API adds arrives
 * named by the API, and the developer who adds the key cannot rename it —
 * so a registry that only listed the prefixes already holding a capitalised
 * leaf would be a list of the mirrors that happened to be caught, rather than
 * the ones that exist.
 */
export const ENUM_MIRROR_PATHS = [
    'capital.common.loanProviderInfo',
    'capital.offer.legalNotice',
    'common.filters.formats',
    'disputes.common.reasonCategories',
    'disputes.common.statuses',
    'disputes.management.defenseDocuments',
    'disputes.management.defenseReasons',
    'disputes.management.details.types',
    'payByLink.common.linkType',
    'payByLink.common.statuses',
    'payouts.details.breakdown.types.adjustments',
    'payouts.details.breakdown.types.fundsCaptured',
    'reports.common.types',
    'transactions.common.statuses',
    'transactions.common.types',
    'transactions.details.refundReasons',
    'transactions.details.summary.adjustments',
    'transactions.details.timeline.statuses',
    'transactions.details.timeline.types',
];

const segmentPattern = /^[a-z][A-Za-z0-9]*$/;
const pluralFamilyPattern = /^(?:plural|\d+)$/;

// An entry is written absolutely when only one domain can own it, and
// domain-relatively when any domain may adopt it — the date formats are a
// reserved Bento route target today and a catalog key the moment a domain
// defines it, so both forms have to match the same entry.
const isEnumMirrorKey = key => {
    const domainRelative = key.slice(key.indexOf('.') + 1);
    return ENUM_MIRROR_PATHS.some(base => key.startsWith(`${base}.`) || domainRelative.startsWith(`${base}.`));
};

/**
 * Rules that hold for one key on its own. `absoluteKey` is optional and only
 * used to consult the enum-mirror registry; route targets, which have no
 * domain, are checked without it.
 */
export const grammarViolations = (relativeKey, absoluteKey = relativeKey) => {
    const segments = relativeKey.split('.');
    const violations = [];
    const violation = (rule, message) => violations.push({ rule, message });
    const depth = segments.length + 1;
    const leaf = segments.at(-1) ?? '';
    const [leafBase, ...pluralParts] = leaf.split('__');
    const enumMirror = isEnumMirrorKey(absoluteKey);

    if (depth > MAX_KEY_DEPTH) {
        violation('depth', `has ${depth} segments (max ${MAX_KEY_DEPTH})`);
    }

    if (segments.slice(1).includes('common')) {
        violation('common-scope', 'uses `common` outside the domain-common scope');
    }

    if (leaf === 'ariaLabel') {
        violation('a11y', 'ends with `ariaLabel`; the grammar uses the compound `a11yLabel`');
    }

    if (pluralParts.length > 1 || (pluralParts.length === 1 && !pluralFamilyPattern.test(pluralParts[0] ?? ''))) {
        violation('plural', 'ends with an unrecognized plural-family suffix; the grammar uses `__plural` or `__<n>`');
    }

    if (GROUP_WORDS.has(leafBase)) {
        violation('group-leaf', `ends with the group word \`${leafBase}\`; a group holds elements, it does not name copy`);
    }

    for (const [index, segment] of segments.entries()) {
        const isLeaf = index === segments.length - 1;
        const base = isLeaf ? leafBase : segment;

        // A singular group word followed by a role is an element carrying its
        // copy (`expiration.error.title`), not a group of one. Only a singular
        // standing in front of named members is the mistake this rule is for.
        const namesMembers = !isLeaf && !ROLE_WORDS.has(segments[index + 1] ?? '');

        if (SINGULAR_GROUP_WORDS.has(base) && namesMembers) {
            violation('group-plural', `groups siblings under the singular \`${base}\`; the grammar uses \`${SINGULAR_GROUP_WORDS.get(base)}\``);
        }

        if (ROLE_WORDS.has(base) && !isLeaf) {
            // A role word may still head a subtree when everything below it is
            // also a role — `creation.description.label` and `.supportText` are
            // the roles of a field that happens to be named "description".
            const children = segments.slice(index + 1);
            if (!children.every(child => ROLE_WORDS.has(child.split('__')[0] ?? ''))) {
                violation('role-leaf', `uses the role word \`${base}\` as a group; roles end a key`);
            }
        }

        if (!enumMirror && !segmentPattern.test(base)) {
            violation('casing', `has the segment \`${segment}\`; segments are lowerCamelCase unless the key is a declared enum mirror`);
        }

        if (enumMirror) continue;

        const structural = structuralSuffixPattern.exec(base);
        if (structural?.groups) {
            violation(
                'folded-role',
                `folds the structural suffix \`${structural.groups.suffix}\` into \`${base}\`; the grammar gives structure its own segment`
            );
        }

        const folded = !isLeaf && foldedGroupPattern.exec(base);
        if (folded && folded.groups) {
            const { base: name, group } = folded.groups;
            violation('folded-group', `folds the group \`${group}\` into \`${base}\`; the grammar writes it as \`${name}.${group.toLowerCase()}\``);
        }
    }

    return violations;
};

/**
 * Rules that only exist across a keyspace. `keys` are absolute catalog keys.
 *
 *   prefix-collision — a key that is also the base path of other keys cannot
 *                      be addressed unambiguously by prefix-based tooling, and
 *                      it hides its siblings from the reachability report.
 *   sibling-suffix   — when a leaf's camel suffix restates a role and a
 *                      sibling shares its base, the suffix is doing a
 *                      segment's job: `tags.incoming` next to
 *                      `tags.incomingDescription` should be `tags.incoming.label`
 *                      and `tags.incoming.description`.
 */
export const keyspaceViolations = keys => {
    const violations = [];
    const keySet = new Set(keys);
    const leavesByParent = new Map();

    for (const key of keys) {
        const parent = key.slice(0, Math.max(0, key.lastIndexOf('.')));
        const leaf = key.slice(key.lastIndexOf('.') + 1);
        if (!leavesByParent.has(parent)) leavesByParent.set(parent, new Set());
        leavesByParent.get(parent).add(leaf);
    }

    for (const key of keys) {
        const children = [...keySet].filter(other => other.startsWith(`${key}.`));
        if (children.length > 0) {
            violations.push({
                key,
                rule: 'prefix-collision',
                message: `is also the base path of ${children.length} other key(s); give it a role segment (for example \`${key}.label\`)`,
            });
        }

        if (isEnumMirrorKey(key)) continue;

        const parent = key.slice(0, Math.max(0, key.lastIndexOf('.')));
        const leaf = key.slice(key.lastIndexOf('.') + 1);
        const match = roleSuffixPattern.exec(leaf);
        if (!match?.groups) continue;

        const base = match.groups.base;
        const siblings = leavesByParent.get(parent) ?? new Set();
        const related = [...siblings].filter(sibling => {
            if (sibling === leaf) return false;
            if (sibling === base) return true;
            const siblingMatch = roleSuffixPattern.exec(sibling);
            return siblingMatch?.groups?.base === base;
        });

        if (related.length > 0) {
            const suffix = match.groups.suffix;
            const role = SUFFIX_ROLE_SEGMENTS.get(suffix) ?? `${suffix[0]?.toLowerCase()}${suffix.slice(1)}`;
            violations.push({
                key,
                rule: 'sibling-suffix',
                message: `distinguishes itself from ${related.map(sibling => `\`${sibling}\``).join(', ')} with the suffix \`${suffix}\`; use the segment \`${base}.${role}\` instead`,
            });
        }
    }

    return violations;
};
