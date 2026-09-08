import { BENTO_TRANSLATION_KEYS, SDK_BENTO_DEFAULT_TRANSLATIONS } from '../../../../sdk/src/translations';
import type { ExternalComponentType } from '@integration-components/types';
import { getV2TranslationKey, type I18n, type V2TranslationDomain } from './Context/types';
import { compileBentoTemplate, compileDomainTranslationFamilyForBento, InvalidBentoTranslationTemplateError } from './bentoTranslationTemplate';

type BentoTranslationKey = string;

/**
 * Do not infer support from `|` in a template: a key rendered without a count
 * displays separators as plain text. The contract test checks this list against
 * every configured SDK Bento catalog.
 */
export const BENTO_PLURAL_TRANSLATION_KEYS = ['bento.file.uploader.restrictions.maxUpload'] as const satisfies ReadonlyArray<BentoTranslationKey>;
const BENTO_PLURAL_TRANSLATION_KEY_SET = new Set<BentoTranslationKey>(BENTO_PLURAL_TRANSLATION_KEYS);

export const BENTO_DOMAIN_OVERRIDES = [
    ['bento.alert.close', 'common.actions.dismiss.labels.close'],
    ['bento.alert.criticalIcon', 'common.a11y.icons.alertCritical'],
    ['bento.alert.highlightIcon', 'common.a11y.icons.alertHighlight'],
    ['bento.alert.successIcon', 'common.a11y.icons.alertSuccess'],
    ['bento.alert.warningIcon', 'common.a11y.icons.alertWarning'],
    ['bento.all.filters.modal.activeFilters', 'common.filters.activeFilters.label'],
    ['bento.all.filters.modal.all', 'common.filters.options.all'],
    ['bento.all.filters.modal.allFilters', 'common.filters.allFilters.label'],
    ['bento.all.filters.modal.applyAll', 'common.actions.apply.labels.all'],
    ['bento.all.filters.modal.clear', 'common.actions.clear.labels.default'],
    ['bento.all.filters.modal.clearAll', 'common.filters.controls.resetAll.label'],
    ['bento.all.filters.modal.noFiltersMatchThisSearch', 'common.filters.errors.noMatches'],
    ['bento.all.filters.modal.otherFilters', 'common.filters.otherFilters.label'],
    ['bento.all.filters.modal.searchBar', 'common.filters.a11y.searchBar'],
    ['bento.base.filter.apply', 'common.actions.apply.labels.default'],
    ['bento.base.filter.clear', 'common.actions.clear.labels.default'],
    ['bento.base.filter.clearFilter', 'common.filters.a11y.clearFilter'],
    ['bento.base.filter.numberSelected', 'common.filters.numberSelected'],
    ['bento.base.filter.reset', 'common.actions.reset.labels.default'],
    ['bento.base.filter.resetFilter', 'common.filters.a11y.resetFilter'],
    ['bento.base.modal.ariaLabelFallback', 'common.a11y.modal'],
    ['bento.base.modal.close', 'common.actions.dismiss.labels.close'],
    ['bento.calendar.month.nextMonth', 'common.filters.types.date.calendar.navigation.nextMonth'],
    ['bento.calendar.month.previousMonth', 'common.filters.types.date.calendar.navigation.previousMonth'],
    ['bento.calendar.year.nextYear', 'common.filters.types.date.calendar.navigation.nextYear'],
    ['bento.calendar.year.previousYear', 'common.filters.types.date.calendar.navigation.previousYear'],
    ['bento.calendar.year.selector.selectYear', 'common.filters.types.date.calendar.navigation.selectYear'],
    ['bento.card.hideContent', 'common.card.hideContent'],
    ['bento.card.showContent', 'common.card.showContent'],
    ['bento.checkbox.group.filter.all', 'common.filters.options.all'],
    ['bento.checkbox.optional', 'common.fields.optional.label'],
    ['bento.copy.copied', 'common.actions.copy.labels.done'],
    ['bento.copy.copy', 'common.actions.copy.labels.default'],
    ['bento.data.grid.cell.actions.copy', 'common.actions.copy.labels.default'],
    ['bento.data.grid.columns.rowActionsColumn', 'common.a11y.rowActionsColumn'],
    ['bento.data.grid.filterBar', 'common.filters.label'],
    ['bento.data.grid.gettingYourData', 'common.states.gettingData'],
    ['bento.data.grid.lazy.load.noResults', 'common.errors.noResults'],
    ['bento.data.grid.noResults', 'common.errors.noResults'],
    ['bento.data.grid.pagination', 'common.pagination.label'],
    ['bento.date.picker.invalidDateFormat', 'common.filters.types.date.errors.invalidFormat'],
    ['bento.date.picker.selectDate', 'common.filters.types.date.selectDate'],
    ['bento.date.range.filter.apply', 'common.actions.apply.labels.default'],
    ['bento.date.range.filter.reset', 'common.actions.reset.labels.default'],
    ['bento.date.range.picker.apply', 'common.actions.apply.labels.default'],
    ['bento.date.range.picker.calendar.customRange', 'common.filters.types.date.rangeSelect.options.custom'],
    ['bento.date.range.picker.calendar.dateFrom', 'common.filters.types.date.a11y.dateFrom'],
    ['bento.date.range.picker.calendar.dateTo', 'common.filters.types.date.a11y.dateTo'],
    ['bento.date.range.picker.calendar.DD-MM-YYYY', 'common.filters.types.date.formats.DD-MM-YYYY'],
    ['bento.date.range.picker.calendar.from', 'common.filters.types.date.inputs.from.label'],
    ['bento.date.range.picker.calendar.invalidDateFormat', 'common.filters.types.date.errors.invalidFormat'],
    ['bento.date.range.picker.calendar.lastMonth', 'common.filters.types.date.rangeSelect.options.lastMonth'],
    ['bento.date.range.picker.calendar.lastSevenDays', 'common.filters.types.date.rangeSelect.options.last7Days'],
    ['bento.date.range.picker.calendar.MM-DD-YYYY', 'common.filters.types.date.formats.MM-DD-YYYY'],
    ['bento.date.range.picker.calendar.selectedDateIsNotAvailable', 'common.filters.types.date.errors.dateUnavailable'],
    ['bento.date.range.picker.calendar.startDateMustPrecedeEndDate', 'common.filters.types.date.errors.startAfterEnd'],
    ['bento.date.range.picker.calendar.to', 'common.filters.types.date.inputs.to.label'],
    ['bento.date.range.picker.calendar.YYYY-MM-DD', 'common.filters.types.date.formats.YYYY-MM-DD'],
    ['bento.date.range.picker.invalidDateFormat', 'common.filters.types.date.errors.invalidFormat'],
    ['bento.dropdown.ariaLabelFallback', 'common.a11y.dropdown'],
    ['bento.dropdown.base.textbox.clearSearch', 'common.inputs.search.clearSearch'],
    ['bento.dropdown.clearSearch', 'common.inputs.search.clearSearch'],
    ['bento.dropdown.options.container.apply', 'common.actions.apply.labels.default'],
    ['bento.dropdown.options.container.noOptionsMatchThisSearch', 'common.inputs.select.errors.noOptions'],
    ['bento.field.label.optional', 'common.fields.optional.label'],
    ['bento.file.uploader.browseFiles', 'common.inputs.file.labels.default'],
    ['bento.file.uploader.file.card.fileExceedsSizeLimit', 'common.inputs.file.errors.tooLarge'],
    ['bento.file.uploader.file.card.fileTypeMustBe', 'common.inputs.file.errors.fileTypeMustBe'],
    ['bento.file.uploader.file.card.imageDimensionsExceedLimits', 'common.inputs.file.errors.invalidDimensions'],
    ['bento.file.uploader.file.card.remove', 'common.inputs.file.actions.remove'],
    ['bento.file.uploader.file.card.retry', 'common.actions.retry.labels.default'],
    ['bento.file.uploader.fileExceedsSizeLimit', 'common.inputs.file.errors.tooLarge'],
    ['bento.file.uploader.restrictions.maxFileSize', 'common.inputs.file.restrictions.maxFileSize'],
    ['bento.file.uploader.restrictions.maxImageDimensions', 'common.inputs.file.restrictions.maxImageDimensions'],
    ['bento.file.uploader.restrictions.maxUpload', 'common.inputs.file.restrictions.maxUpload'],
    ['bento.file.uploader.restrictions.supportedFileTypes', 'common.inputs.file.restrictions.supportedFileTypes'],
    ['bento.file.uploader.tooManyFiles', 'common.inputs.file.errors.tooMany'],
    ['bento.file.uploader.youHaveExceededTheMaximum', 'common.inputs.file.errors.exceededMaximum'],
    ['bento.filter.bar.clearFilters', 'common.filters.controls.resetAll.label'],
    ['bento.filter.bar.filtersHaveBeenCleared', 'common.filters.cleared'],
    ['bento.filter.bar.filtersHaveBeenReset', 'common.filters.reset'],
    ['bento.filter.bar.resetFilters', 'common.filters.controls.resetAll.label'],
    ['bento.filter.bar.undo', 'common.actions.undo.labels.default'],
    ['bento.input.field.ariaLabelFallback', 'common.a11y.inputField'],
    ['bento.modal.fullscreen.page.close', 'common.actions.dismiss.labels.close'],
    ['bento.pagination.context.pageNumber', 'common.pagination.context.pageNumber'],
    ['bento.pagination.context.pageNumberOfTotal', 'common.pagination.context.pageNumberOfTotal'],
    ['bento.pagination.controls.navigateToTheNextPage', 'common.pagination.controls.nextPage.label'],
    ['bento.pagination.controls.navigateToThePreviousPage', 'common.pagination.controls.previousPage.label'],
    ['bento.pagination.results.per.page.showingItems', 'common.pagination.results.per.page.showingItems'],
    ['bento.search.bar.clearSearch', 'common.inputs.search.clearSearch'],
    ['bento.select.filter.button.all', 'common.filters.options.all'],
    ['bento.select.filter.button.noFiltersMatchThisSearch', 'common.filters.errors.noMatches'],
    ['bento.select.filter.button.searchFilter', 'common.filters.a11y.searchFilter'],
    ['bento.timeline.item.showLess', 'common.timeline.timelineItem.showLess'],
    ['bento.timeline.item.showMore', 'common.timeline.timelineItem.showMoreItems'],
    ['bento.toast.item.dismiss', 'common.actions.dismiss.labels.dismiss'],
] as const satisfies ReadonlyArray<readonly [BentoTranslationKey, string]>;

type BentoComponentDomainOverride = {
    bentoKey: BentoTranslationKey;
    componentNames: readonly ExternalComponentType[];
    domainKey: string;
};

const OVERVIEW_COMPONENT_NAMES: readonly ExternalComponentType[] = ['disputes', 'paymentLinksOverview', 'payouts', 'reports', 'transactions'];

/**
 * Routes whose copy belongs to a specific external component instead of the
 * domain-common namespace. Keep these explicit: Bento cannot infer where a
 * domain owns a key, and falling back to SDK copy would hide a domain change.
 */
export const BENTO_COMPONENT_DOMAIN_OVERRIDES = [
    {
        bentoKey: 'bento.data.grid.pagination',
        componentNames: ['disputes'],
        domainKey: 'overview.common.pagination.a11y.label',
    },
    {
        bentoKey: 'bento.data.grid.pagination',
        componentNames: ['paymentLinksOverview', 'payouts', 'reports', 'transactions'],
        domainKey: 'overview.pagination.label',
    },
    {
        bentoKey: 'bento.date.range.picker.calendar.customRange',
        componentNames: OVERVIEW_COMPONENT_NAMES,
        domainKey: 'overview.common.filters.types.date.rangeSelect.options.custom',
    },
    {
        bentoKey: 'bento.date.range.picker.calendar.lastMonth',
        componentNames: OVERVIEW_COMPONENT_NAMES,
        domainKey: 'overview.common.filters.types.date.rangeSelect.options.lastMonth',
    },
    {
        bentoKey: 'bento.date.range.picker.calendar.lastSevenDays',
        componentNames: OVERVIEW_COMPONENT_NAMES,
        domainKey: 'overview.common.filters.types.date.rangeSelect.options.last7Days',
    },
] as const satisfies readonly BentoComponentDomainOverride[];

const appliesToComponent = (componentNames: readonly ExternalComponentType[], componentName: ExternalComponentType | undefined): boolean =>
    componentName !== undefined && componentNames.includes(componentName);

export const applyBentoDomainOverrides = (
    overrides: Record<string, string>,
    i18n: I18n,
    bentoTranslations: Readonly<Record<string, string>>,
    domain: V2TranslationDomain,
    componentName?: ExternalComponentType
): void => {
    for (const [bentoKey, domainKey] of BENTO_DOMAIN_OVERRIDES) {
        const componentOverride = BENTO_COMPONENT_DOMAIN_OVERRIDES.find(
            override => override.bentoKey === bentoKey && appliesToComponent(override.componentNames, componentName)
        );
        const resolvedDomainKey = componentOverride?.domainKey ?? domainKey;
        const translationKey = getV2TranslationKey(domain, resolvedDomainKey);
        const domainTranslationFamily = i18n.getTranslationFamily(translationKey);
        const bentoTemplate = bentoTranslations[bentoKey] ?? SDK_BENTO_DEFAULT_TRANSLATIONS[bentoKey];
        let translation = bentoTranslations[bentoKey];

        if (componentOverride && domainTranslationFamily.base === null) {
            throw new Error(`[Bento translations] Missing component-specific domain translation: ${translationKey}`);
        }

        if (bentoTemplate) {
            try {
                const hasPluralTemplates =
                    domainTranslationFamily.zero !== null || domainTranslationFamily.one !== null || domainTranslationFamily.plural !== null;

                if (!hasPluralTemplates || BENTO_PLURAL_TRANSLATION_KEY_SET.has(bentoKey)) {
                    translation = compileDomainTranslationFamilyForBento(domainTranslationFamily, bentoTemplate) ?? translation;
                }
            } catch (error) {
                if (!(error instanceof InvalidBentoTranslationTemplateError)) throw error;
            }
        }

        if (translation) {
            overrides[bentoKey] = translation;
        } else {
            delete overrides[bentoKey];
        }
    }
};

export const getBentoLocaleMessages = (
    getTranslationTemplate: (key: string) => string | null,
    hasTranslation: (key: string) => boolean
): Record<string, string> =>
    Object.fromEntries(
        BENTO_TRANSLATION_KEYS.filter(hasTranslation).flatMap(key => {
            const template = getTranslationTemplate(key);

            if (!template) return [];

            try {
                return [[key, compileBentoTemplate(template)]];
            } catch (error) {
                if (error instanceof InvalidBentoTranslationTemplateError) return [];
                throw error;
            }
        })
    );
