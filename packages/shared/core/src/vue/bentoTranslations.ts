import { BENTO_TRANSLATION_KEYS, SDK_BENTO_DEFAULT_TRANSLATIONS } from '../../../../sdk/src/translations';
import { compileBentoTemplate, compileDomainTranslationFamilyForBento, InvalidBentoTranslationTemplateError } from './bentoTranslationTemplate';
import { getDomainTranslationKey, type I18n, type TranslationDomain } from './Context/types';
import type { BentoTranslationKey } from '@adyen/bento-vue3/translation-keys';
import type { ExternalComponentType } from '@integration-components/types';

/**
 * Do not infer support from `|` in a template: a key rendered without a count
 * displays separators as plain text. The contract test checks this list against
 * every configured SDK Bento catalog.
 */
export const BENTO_PLURAL_TRANSLATION_KEYS = ['bento.fileUploaderRestrictions.maxUpload'] as const satisfies ReadonlyArray<BentoTranslationKey>;
const BENTO_PLURAL_TRANSLATION_KEY_SET = new Set<BentoTranslationKey>(BENTO_PLURAL_TRANSLATION_KEYS);

export const BENTO_DOMAIN_OVERRIDES = [
    ['bento.alert.close', 'common.actions.dismiss.labels.close'],
    ['bento.alert.criticalIcon', 'common.a11y.icons.alertCritical'],
    ['bento.alert.highlightIcon', 'common.a11y.icons.alertHighlight'],
    ['bento.alert.successIcon', 'common.a11y.icons.alertSuccess'],
    ['bento.alert.warningIcon', 'common.a11y.icons.alertWarning'],
    ['bento.allFiltersModal.activeFilters', 'common.filters.activeFilters.label'],
    ['bento.allFiltersModal.all', 'common.filters.options.all'],
    ['bento.allFiltersModal.allFilters', 'common.filters.allFilters.label'],
    ['bento.allFiltersModal.applyAll', 'common.actions.apply.labels.all'],
    ['bento.allFiltersModal.clear', 'common.actions.clear.labels.default'],
    ['bento.allFiltersModal.clearAll', 'common.filters.controls.resetAll.label'],
    ['bento.allFiltersModal.noFiltersMatchThisSearch', 'common.filters.errors.noMatches'],
    ['bento.allFiltersModal.otherFilters', 'common.filters.otherFilters.label'],
    ['bento.allFiltersModal.searchBar', 'common.filters.a11y.searchBar'],
    ['bento.baseFilter.apply', 'common.actions.apply.labels.default'],
    ['bento.baseFilter.clear', 'common.actions.clear.labels.default'],
    ['bento.baseFilter.clearFilter', 'common.filters.a11y.clearFilter'],
    ['bento.baseFilter.numberSelected', 'common.filters.numberSelected'],
    ['bento.baseFilter.reset', 'common.actions.reset.labels.default'],
    ['bento.baseFilter.resetFilter', 'common.filters.a11y.resetFilter'],
    ['bento.baseModal.ariaLabelFallback', 'common.a11y.modal'],
    ['bento.baseModal.close', 'common.actions.dismiss.labels.close'],
    ['bento.calendarMonth.nextMonth', 'common.filters.types.date.calendar.navigation.nextMonth'],
    ['bento.calendarMonth.previousMonth', 'common.filters.types.date.calendar.navigation.previousMonth'],
    ['bento.calendarYear.nextYear', 'common.filters.types.date.calendar.navigation.nextYear'],
    ['bento.calendarYear.previousYear', 'common.filters.types.date.calendar.navigation.previousYear'],
    ['bento.calendarYearSelector.selectYear', 'common.filters.types.date.calendar.navigation.selectYear'],
    ['bento.card.hideContent', 'common.card.hideContent'],
    ['bento.card.showContent', 'common.card.showContent'],
    ['bento.checkboxGroupFilter.all', 'common.filters.options.all'],
    ['bento.checkbox.optional', 'common.fields.optional.label'],
    ['bento.copy.copied', 'common.actions.copy.labels.done'],
    ['bento.copy.copy', 'common.actions.copy.labels.default'],
    ['bento.dataGridCellActions.copy', 'common.actions.copy.labels.default'],
    ['bento.dataGridColumns.rowActionsColumn', 'common.a11y.rowActionsColumn'],
    ['bento.dataGrid.filterBar', 'common.filters.label'],
    ['bento.dataGrid.gettingYourData', 'common.states.gettingData'],
    ['bento.dataGridLazyLoad.noResults', 'common.errors.noResults'],
    ['bento.dataGrid.noResults', 'common.errors.noResults'],
    ['bento.dataGrid.pagination', 'common.pagination.label'],
    ['bento.datePicker.invalidDateFormat', 'common.filters.types.date.errors.invalidFormat'],
    ['bento.datePicker.selectDate', 'common.filters.types.date.selectDate'],
    ['bento.dateRangeFilter.apply', 'common.actions.apply.labels.default'],
    ['bento.dateRangeFilter.reset', 'common.actions.reset.labels.default'],
    ['bento.dateRangePicker.apply', 'common.actions.apply.labels.default'],
    ['bento.dateRangePickerCalendar.customRange', 'common.filters.types.date.rangeSelect.options.custom'],
    ['bento.dateRangePickerCalendar.dateFrom', 'common.filters.types.date.a11y.dateFrom'],
    ['bento.dateRangePickerCalendar.dateTo', 'common.filters.types.date.a11y.dateTo'],
    ['bento.dateRangePickerCalendar.DD-MM-YYYY', 'common.filters.types.date.formats.DD-MM-YYYY'],
    ['bento.dateRangePickerCalendar.from', 'common.filters.types.date.inputs.from.label'],
    ['bento.dateRangePickerCalendar.invalidDateFormat', 'common.filters.types.date.errors.invalidFormat'],
    ['bento.dateRangePickerCalendar.lastMonth', 'common.filters.types.date.rangeSelect.options.lastMonth'],
    ['bento.dateRangePickerCalendar.lastSevenDays', 'common.filters.types.date.rangeSelect.options.last7Days'],
    ['bento.dateRangePickerCalendar.MM-DD-YYYY', 'common.filters.types.date.formats.MM-DD-YYYY'],
    ['bento.dateRangePickerCalendar.selectedDateIsNotAvailable', 'common.filters.types.date.errors.dateUnavailable'],
    ['bento.dateRangePickerCalendar.startDateMustPrecedeEndDate', 'common.filters.types.date.errors.startAfterEnd'],
    ['bento.dateRangePickerCalendar.to', 'common.filters.types.date.inputs.to.label'],
    ['bento.dateRangePickerCalendar.YYYY-MM-DD', 'common.filters.types.date.formats.YYYY-MM-DD'],
    ['bento.dateRangePicker.invalidDateFormat', 'common.filters.types.date.errors.invalidFormat'],
    ['bento.dropdown.ariaLabelFallback', 'common.a11y.dropdown'],
    ['bento.dropdownBaseTextbox.clearSearch', 'common.inputs.search.clearSearch'],
    ['bento.dropdown.clearSearch', 'common.inputs.search.clearSearch'],
    ['bento.dropdownOptionsContainer.apply', 'common.actions.apply.labels.default'],
    ['bento.dropdownOptionsContainer.noOptionsMatchThisSearch', 'common.inputs.select.errors.noOptions'],
    ['bento.fieldLabel.optional', 'common.fields.optional.label'],
    ['bento.fileUploader.browseFiles', 'common.inputs.file.labels.default'],
    ['bento.fileUploaderFileCard.fileExceedsSizeLimit', 'common.inputs.file.errors.tooLarge'],
    ['bento.fileUploaderFileCard.fileTypeMustBe', 'common.inputs.file.errors.fileTypeMustBe'],
    ['bento.fileUploaderFileCard.imageDimensionsExceedLimits', 'common.inputs.file.errors.invalidDimensions'],
    ['bento.fileUploaderFileCard.remove', 'common.inputs.file.actions.remove'],
    ['bento.fileUploaderFileCard.retry', 'common.actions.retry.labels.default'],
    ['bento.fileUploader.fileExceedsSizeLimit', 'common.inputs.file.errors.tooLarge'],
    ['bento.fileUploaderRestrictions.maxFileSize', 'common.inputs.file.restrictions.maxFileSize'],
    ['bento.fileUploaderRestrictions.maxImageDimensions', 'common.inputs.file.restrictions.maxImageDimensions'],
    ['bento.fileUploaderRestrictions.maxUpload', 'common.inputs.file.restrictions.maxUpload'],
    ['bento.fileUploaderRestrictions.supportedFileTypes', 'common.inputs.file.restrictions.supportedFileTypes'],
    ['bento.fileUploader.tooManyFiles', 'common.inputs.file.errors.tooMany'],
    ['bento.fileUploader.youHaveExceededTheMaximum', 'common.inputs.file.errors.exceededMaximum'],
    ['bento.filterBar.clearFilters', 'common.filters.controls.resetAll.label'],
    ['bento.filterBar.filtersHaveBeenCleared', 'common.filters.cleared'],
    ['bento.filterBar.filtersHaveBeenReset', 'common.filters.reset'],
    ['bento.filterBar.resetFilters', 'common.filters.controls.resetAll.label'],
    ['bento.filterBar.undo', 'common.actions.undo.labels.default'],
    ['bento.inputField.ariaLabelFallback', 'common.a11y.inputField'],
    ['bento.modalFullscreenPage.close', 'common.actions.dismiss.labels.close'],
    ['bento.paginationContext.pageNumber', 'common.pagination.context.pageNumber'],
    ['bento.paginationContext.pageNumberOfTotal', 'common.pagination.context.pageNumberOfTotal'],
    ['bento.paginationControls.navigateToTheNextPage', 'common.pagination.controls.nextPage.label'],
    ['bento.paginationControls.navigateToThePreviousPage', 'common.pagination.controls.previousPage.label'],
    ['bento.paginationResultsPerPage.showingItems', 'common.pagination.results.per.page.showingItems'],
    ['bento.searchBar.clearSearch', 'common.inputs.search.clearSearch'],
    ['bento.selectFilterButton.all', 'common.filters.options.all'],
    ['bento.selectFilterButton.noFiltersMatchThisSearch', 'common.filters.errors.noMatches'],
    ['bento.selectFilterButton.searchFilter', 'common.filters.a11y.searchFilter'],
    ['bento.timelineItem.showLess', 'common.timeline.timelineItem.showLess'],
    ['bento.timelineItem.showMore', 'common.timeline.timelineItem.showMoreItems'],
    ['bento.toastItem.dismiss', 'common.actions.dismiss.labels.dismiss'],
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
        bentoKey: 'bento.dataGrid.pagination',
        componentNames: ['disputes'],
        domainKey: 'overview.common.pagination.a11y.label',
    },
    {
        bentoKey: 'bento.dataGrid.pagination',
        componentNames: ['paymentLinksOverview', 'payouts', 'reports', 'transactions'],
        domainKey: 'overview.pagination.label',
    },
    {
        bentoKey: 'bento.dateRangePickerCalendar.customRange',
        componentNames: OVERVIEW_COMPONENT_NAMES,
        domainKey: 'overview.common.filters.types.date.rangeSelect.options.custom',
    },
    {
        bentoKey: 'bento.dateRangePickerCalendar.lastMonth',
        componentNames: OVERVIEW_COMPONENT_NAMES,
        domainKey: 'overview.common.filters.types.date.rangeSelect.options.lastMonth',
    },
    {
        bentoKey: 'bento.dateRangePickerCalendar.lastSevenDays',
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
    domain: TranslationDomain,
    componentName?: ExternalComponentType
): void => {
    for (const [bentoKey, domainKey] of BENTO_DOMAIN_OVERRIDES) {
        const componentOverride = BENTO_COMPONENT_DOMAIN_OVERRIDES.find(
            override => override.bentoKey === bentoKey && appliesToComponent(override.componentNames, componentName)
        );
        const resolvedDomainKey = componentOverride?.domainKey ?? domainKey;
        const translationKey = getDomainTranslationKey(domain, resolvedDomainKey);
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
