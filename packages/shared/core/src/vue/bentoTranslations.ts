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
    ['bento.alert.close', 'common.close.label'],
    ['bento.alert.criticalIcon', 'common.a11y.icons.alertCritical'],
    ['bento.alert.highlightIcon', 'common.a11y.icons.alertHighlight'],
    ['bento.alert.successIcon', 'common.a11y.icons.alertSuccess'],
    ['bento.alert.warningIcon', 'common.a11y.icons.alertWarning'],
    ['bento.allFiltersModal.activeFilters', 'common.filters.activeFilters.label'],
    ['bento.allFiltersModal.all', 'common.filters.options.all'],
    ['bento.allFiltersModal.allFilters', 'common.filters.allFilters.label'],
    ['bento.allFiltersModal.applyAll', 'common.applyAll.label'],
    ['bento.allFiltersModal.clear', 'common.clear.label'],
    ['bento.allFiltersModal.clearAll', 'common.filters.resetAll.label'],
    ['bento.allFiltersModal.noFiltersMatchThisSearch', 'common.filters.errors.noMatches'],
    ['bento.allFiltersModal.otherFilters', 'common.filters.otherFilters.label'],
    ['bento.allFiltersModal.searchBar', 'common.filters.a11y.searchBar'],
    ['bento.baseFilter.apply', 'common.apply.label'],
    ['bento.baseFilter.clear', 'common.clear.label'],
    ['bento.baseFilter.clearFilter', 'common.filters.a11y.clearFilter'],
    ['bento.baseFilter.numberSelected', 'common.filters.numberSelected'],
    ['bento.baseFilter.reset', 'common.reset.label'],
    ['bento.baseFilter.resetFilter', 'common.filters.a11y.resetFilter'],
    ['bento.baseModal.ariaLabelFallback', 'common.a11y.modal'],
    ['bento.baseModal.close', 'common.close.label'],
    ['bento.calendarMonth.nextMonth', 'common.filters.date.nextMonth'],
    ['bento.calendarMonth.previousMonth', 'common.filters.date.previousMonth'],
    ['bento.calendarYear.nextYear', 'common.filters.date.nextYear'],
    ['bento.calendarYear.previousYear', 'common.filters.date.previousYear'],
    ['bento.calendarYearSelector.selectYear', 'common.filters.date.selectYear'],
    ['bento.card.hideContent', 'common.card.hideContent'],
    ['bento.card.showContent', 'common.card.showContent'],
    ['bento.checkboxGroupFilter.all', 'common.filters.options.all'],
    ['bento.checkbox.optional', 'common.fields.optional.label'],
    ['bento.copy.copied', 'common.copy.done'],
    ['bento.copy.copy', 'common.copy.label'],
    ['bento.dataGridCellActions.copy', 'common.copy.label'],
    ['bento.dataGridColumns.rowActionsColumn', 'common.a11y.rowActionsColumn'],
    ['bento.dataGrid.filterBar', 'common.filters.label'],
    ['bento.dataGrid.gettingYourData', 'common.states.gettingData'],
    ['bento.dataGridLazyLoad.noResults', 'common.errors.noResults'],
    ['bento.dataGrid.noResults', 'common.errors.noResults'],
    ['bento.dataGrid.pagination', 'common.pagination.label'],
    ['bento.datePicker.invalidDateFormat', 'common.filters.errors.invalidFormat'],
    ['bento.datePicker.selectDate', 'common.filters.date.selectDate'],
    ['bento.dateRangeFilter.apply', 'common.apply.label'],
    ['bento.dateRangeFilter.reset', 'common.reset.label'],
    ['bento.dateRangePicker.apply', 'common.apply.label'],
    ['bento.dateRangePickerCalendar.customRange', 'common.filters.date.custom'],
    ['bento.dateRangePickerCalendar.dateFrom', 'common.filters.a11y.dateFrom'],
    ['bento.dateRangePickerCalendar.dateTo', 'common.filters.a11y.dateTo'],
    ['bento.dateRangePickerCalendar.DD-MM-YYYY', 'common.filters.formats.DD-MM-YYYY'],
    ['bento.dateRangePickerCalendar.from', 'common.filters.date.from'],
    ['bento.dateRangePickerCalendar.invalidDateFormat', 'common.filters.errors.invalidFormat'],
    ['bento.dateRangePickerCalendar.lastMonth', 'common.filters.date.lastMonth'],
    ['bento.dateRangePickerCalendar.lastSevenDays', 'common.filters.date.last7Days'],
    ['bento.dateRangePickerCalendar.MM-DD-YYYY', 'common.filters.formats.MM-DD-YYYY'],
    ['bento.dateRangePickerCalendar.selectedDateIsNotAvailable', 'common.filters.errors.dateUnavailable'],
    ['bento.dateRangePickerCalendar.startDateMustPrecedeEndDate', 'common.filters.errors.startAfterEnd'],
    ['bento.dateRangePickerCalendar.to', 'common.filters.date.to'],
    ['bento.dateRangePickerCalendar.YYYY-MM-DD', 'common.filters.formats.YYYY-MM-DD'],
    ['bento.dateRangePicker.invalidDateFormat', 'common.filters.errors.invalidFormat'],
    ['bento.dropdown.ariaLabelFallback', 'common.a11y.dropdown'],
    ['bento.dropdownBaseTextbox.clearSearch', 'common.search.clearSearch'],
    ['bento.dropdown.clearSearch', 'common.search.clearSearch'],
    ['bento.dropdownOptionsContainer.apply', 'common.apply.label'],
    ['bento.dropdownOptionsContainer.noOptionsMatchThisSearch', 'common.select.errors.noOptions'],
    ['bento.fieldLabel.optional', 'common.fields.optional.label'],
    ['bento.fileUploader.browseFiles', 'common.file.label'],
    ['bento.fileUploaderFileCard.fileExceedsSizeLimit', 'common.file.errors.tooLarge'],
    ['bento.fileUploaderFileCard.fileTypeMustBe', 'common.file.errors.fileTypeMustBe'],
    ['bento.fileUploaderFileCard.imageDimensionsExceedLimits', 'common.file.errors.invalidDimensions'],
    ['bento.fileUploaderFileCard.remove', 'common.file.remove.label'],
    ['bento.fileUploaderFileCard.retry', 'common.retry.label'],
    ['bento.fileUploader.fileExceedsSizeLimit', 'common.file.errors.tooLarge'],
    ['bento.fileUploaderRestrictions.maxFileSize', 'common.file.restrictions.maxFileSize'],
    ['bento.fileUploaderRestrictions.maxImageDimensions', 'common.file.restrictions.maxImageDimensions'],
    ['bento.fileUploaderRestrictions.maxUpload', 'common.file.restrictions.maxUpload'],
    ['bento.fileUploaderRestrictions.supportedFileTypes', 'common.file.restrictions.supportedFileTypes'],
    ['bento.fileUploader.tooManyFiles', 'common.file.errors.tooMany'],
    ['bento.fileUploader.youHaveExceededTheMaximum', 'common.file.errors.exceededMaximum'],
    ['bento.filterBar.clearFilters', 'common.filters.resetAll.label'],
    ['bento.filterBar.filtersHaveBeenCleared', 'common.filters.cleared'],
    ['bento.filterBar.filtersHaveBeenReset', 'common.filters.reset'],
    ['bento.filterBar.resetFilters', 'common.filters.resetAll.label'],
    ['bento.filterBar.undo', 'common.undo.label'],
    ['bento.inputField.ariaLabelFallback', 'common.a11y.inputField'],
    ['bento.modalFullscreenPage.close', 'common.close.label'],
    ['bento.paginationContext.pageNumber', 'common.pagination.context.pageNumber'],
    ['bento.paginationContext.pageNumberOfTotal', 'common.pagination.context.pageNumberOfTotal'],
    ['bento.paginationControls.navigateToTheNextPage', 'common.pagination.nextPage.label'],
    ['bento.paginationControls.navigateToThePreviousPage', 'common.pagination.previousPage.label'],
    ['bento.paginationResultsPerPage.showingItems', 'common.pagination.showingItems'],
    ['bento.searchBar.clearSearch', 'common.search.clearSearch'],
    ['bento.selectFilterButton.all', 'common.filters.options.all'],
    ['bento.selectFilterButton.noFiltersMatchThisSearch', 'common.filters.errors.noMatches'],
    ['bento.selectFilterButton.searchFilter', 'common.filters.a11y.searchFilter'],
    ['bento.timelineItem.showLess', 'common.timeline.showLess'],
    ['bento.timelineItem.showMore', 'common.timeline.showMore'],
    ['bento.toastItem.dismiss', 'common.dismiss.label'],
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
        domainKey: 'overview.pagination.a11yLabel',
    },
    {
        bentoKey: 'bento.dataGrid.pagination',
        componentNames: ['paymentLinksOverview', 'payouts', 'reports', 'transactions'],
        domainKey: 'overview.pagination.a11yLabel',
    },
    {
        bentoKey: 'bento.dateRangePickerCalendar.customRange',
        componentNames: OVERVIEW_COMPONENT_NAMES,
        domainKey: 'overview.filters.date.custom',
    },
    {
        bentoKey: 'bento.dateRangePickerCalendar.lastMonth',
        componentNames: OVERVIEW_COMPONENT_NAMES,
        domainKey: 'overview.filters.date.lastMonth',
    },
    {
        bentoKey: 'bento.dateRangePickerCalendar.lastSevenDays',
        componentNames: OVERVIEW_COMPONENT_NAMES,
        domainKey: 'overview.filters.date.last7Days',
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
    getTranslationTemplate: (key: BentoTranslationKey) => string | null,
    hasTranslation: (key: BentoTranslationKey) => boolean
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
