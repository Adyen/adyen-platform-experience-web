import { isFunction, isPlainObject } from '@integration-components/utils';
import type { ExternalComponentType, GlobalAppearance } from '@integration-components/types';
import { encodeAnalyticsEvent, getEventInsertId, getEventTime } from './utils';
import { getUserAgent } from '../../runtime';
import type { CoreOptions, ThemeMode } from '../../types';
import type { MixpanelProperty } from './user-events';
import { COMPONENT_DATA_EVENT_CAPABILITIES } from './component-data-capabilities';

/**
 * Core events from the Mixpanel core-events data dictionary. They complement
 * 'Customized translation' and share its base properties
 * (category: PIE / subCategory: Core), sent through the session analytics channel.
 */
export const CORE_EVENT_NAMES = {
    initiatedCore: 'Initiated core',
    customizedComponentStyle: 'Customized component style',
    customizedComponentData: 'Customized component data',
    updatedTheme: 'Updated theme (runtime)',
} as const;

export type CoreEventName = (typeof CORE_EVENT_NAMES)[keyof typeof CORE_EVENT_NAMES];

/**
 * Funnel section of an embedded component, following the
 * Overview / Details / Offer taxonomy from the data dictionary.
 */
export type ComponentEventSubCategory = 'Overview' | 'Details' | 'Offer';

// Exhaustive on purpose: adding an external component type forces a conscious decision here.
const COMPONENT_EVENT_SUB_CATEGORIES: Record<ExternalComponentType, ComponentEventSubCategory> = {
    capitalOverview: 'Overview',
    capitalOffer: 'Offer',
    disputes: 'Overview',
    disputesManagement: 'Details',
    paymentLinkCreation: 'Offer',
    paymentLinkDetails: 'Details',
    paymentLinksOverview: 'Overview',
    paymentLinkSettings: 'Details',
    payouts: 'Overview',
    payoutDetails: 'Details',
    reports: 'Overview',
    transactions: 'Overview',
    transactionDetails: 'Details',
};

export const getComponentEventSubCategory = (componentName: ExternalComponentType): ComponentEventSubCategory =>
    COMPONENT_EVENT_SUB_CATEGORIES[componentName] ?? 'Overview';

type AppearanceOption = 'hidden' | 'visible' | 'default';

const toAppearanceOption = (value: unknown): AppearanceOption => (value === 'hidden' || value === 'visible' ? value : 'default');

const asRecord = (value: unknown): Record<string, unknown> => (isPlainObject(value) ? (value as Record<string, unknown>) : {});

/**
 * Appearance properties shared by every appearance-carrying core event:
 * configured keys and explicitly configured title/illustration visibility.
 */
const getAppearanceEventProperties = (appearance: GlobalAppearance | undefined): Record<string, MixpanelProperty> => {
    const properties: Record<string, MixpanelProperty> = {};
    const appearanceKeys = appearance ? Object.keys(appearance) : [];
    const titles = toAppearanceOption(appearance?.titles);
    const illustrations = toAppearanceOption(appearance?.illustrations);

    if (appearanceKeys.length > 0) properties.appearance = appearanceKeys;
    if (titles !== 'default') properties.appearanceTitles = titles;
    if (illustrations !== 'default') properties.appearanceIllustrations = illustrations;

    return properties;
};

/**
 * Token names of the per-mode custom theme, without their values: the distribution tells us
 * which tokens to document or expose, and it keeps integrator brand colors out of analytics.
 */
const getCustomThemeVariables = (customTheme: CoreOptions<any>['customTheme']): string[] => {
    const variableNames = new Set<string>();

    for (const mode of ['light', 'dark'] as const) {
        for (const variableName of Object.keys(asRecord(customTheme?.[mode]))) {
            variableNames.add(variableName);
        }
    }

    return [...variableNames];
};

/**
 * Properties of the 'Initiated core' event: a full snapshot of the v2 configuration
 * surface (theme mode, custom theme tokens, appearance), fired once per core initialization.
 */
export const getInitiatedCoreEventProperties = (options: CoreOptions<any>): Record<string, MixpanelProperty> => {
    const customThemeVariables = getCustomThemeVariables(options.customTheme);

    return {
        label: 'core',
        ...(options.themeMode !== undefined ? { themeMode: options.themeMode } : {}),
        hasCustomTheme: customThemeVariables.length > 0,
        ...(customThemeVariables.length > 0 ? { customThemeVariables } : {}),
        ...getAppearanceEventProperties(options.appearance),
    };
};

export interface ComponentEventContext {
    /** Name of the mounted component, sent as the event `label`. */
    componentName: ExternalComponentType;
    /** The appearance resolved for this mount (component props falling back to Core options). */
    appearance?: GlobalAppearance | undefined;
    /** The props the integrator passed for this mount. */
    componentProps: Record<string, unknown>;
}

/** Runtime capabilities generated from each component's external prop type. */
export interface ComponentDataEventCapabilityConfiguration {
    callbackProps?: readonly string[];
    dataCustomization?: readonly ('dataGrid' | 'details')[];
    fieldsConfig?: string;
    pagination?: boolean;
    balanceAccountId?: boolean;
}

export interface ComponentDataEventContext {
    componentName: ExternalComponentType;
    componentProps: Record<string, unknown>;
}

/**
 * Properties of the 'Customized component style' event: how the integrator configured
 * appearance options for the mounted component.
 */
export const getCustomizedComponentStyleEventProperties = ({
    componentName,
    appearance,
}: ComponentEventContext): Record<string, MixpanelProperty> => ({
    label: componentName,
    subCategory: getComponentEventSubCategory(componentName),
    ...getAppearanceEventProperties(appearance),
});

const getHiddenDetailFieldNames = (fields: unknown): string[] =>
    Array.isArray(fields)
        ? fields
              .filter(field => isPlainObject(field) && (field as Record<string, unknown>).visibility === 'hidden')
              .map(field => String((field as Record<string, unknown>).key))
        : [];

/**
 * Flattens a PBL `fieldsConfig.visibility` map into hidden/readOnly field names.
 * Parent fields configured per sub-field (e.g. `amount: { currency: 'hidden' }`)
 * are reported as `amount.currency`.
 */
const getFieldVisibility = (visibility: unknown): { hidden: string[]; readOnly: string[] } => {
    const hidden: string[] = [];
    const readOnly: string[] = [];

    for (const [fieldName, fieldVisibility] of Object.entries(asRecord(visibility))) {
        if (typeof fieldVisibility === 'string') {
            if (fieldVisibility === 'hidden') hidden.push(fieldName);
            else if (fieldVisibility === 'readOnly') readOnly.push(fieldName);
        } else {
            for (const [subFieldName, subFieldVisibility] of Object.entries(asRecord(fieldVisibility))) {
                const qualifiedName = `${fieldName}.${subFieldName}`;
                if (subFieldVisibility === 'hidden') hidden.push(qualifiedName);
                else if (subFieldVisibility === 'readOnly') readOnly.push(qualifiedName);
            }
        }
    }

    return { hidden, readOnly };
};

const getPropertyAtPath = (record: Record<string, unknown>, path: string): unknown =>
    path.split('.').reduce<unknown>((value, key) => asRecord(value)[key], record);

/**
 * Properties of the 'Customized component data' event: supported component props for
 * callbacks, custom columns, hidden detail fields, PBL field configuration, and pagination.
 */
export const getCustomizedComponentDataEventProperties = ({
    componentName,
    componentProps,
}: ComponentDataEventContext): Record<string, MixpanelProperty> => {
    const capabilities = COMPONENT_DATA_EVENT_CAPABILITIES[componentName] ?? {};
    const callbackProps = capabilities.callbackProps ?? [];
    const callbackNames = callbackProps.map(path => path.slice(path.lastIndexOf('.') + 1));
    const supportsCallback = (propName: string): boolean => callbackNames.includes(propName);
    const hasCallback = (propName: string): boolean =>
        callbackProps.some(path => path.slice(path.lastIndexOf('.') + 1) === propName && isFunction(getPropertyAtPath(componentProps, path)));
    const dataCustomization = asRecord(componentProps.dataCustomization);
    const supportsDataGrid = capabilities.dataCustomization?.includes('dataGrid') ?? false;
    const supportsDetails = capabilities.dataCustomization?.includes('details') ?? false;
    const dataGridCustomization = supportsDataGrid ? asRecord(dataCustomization.dataGrid) : {};
    const detailsCustomization = supportsDetails ? asRecord(dataCustomization.details) : {};
    const fieldsConfigValue = capabilities.fieldsConfig ? getPropertyAtPath(componentProps, capabilities.fieldsConfig) : undefined;
    const hasFieldsConfig = capabilities.fieldsConfig !== undefined && isPlainObject(fieldsConfigValue);
    const fieldsConfig = hasFieldsConfig ? asRecord(fieldsConfigValue) : {};
    const pagination = capabilities.pagination ? asRecord(componentProps.pagination) : {};

    const customColumns = Array.isArray(dataGridCustomization.fields)
        ? dataGridCustomization.fields.map(column => String((column as Record<string, unknown>).key))
        : undefined;

    const hiddenDetailFields = getHiddenDetailFieldNames(detailsCustomization.fields);
    const fieldVisibility = getFieldVisibility(fieldsConfig.visibility);

    return {
        label: componentName,
        subCategory: getComponentEventSubCategory(componentName),

        ...(supportsCallback('onDismiss') ? { hasOnDismiss: hasCallback('onDismiss') } : {}),
        ...(supportsCallback('onContactSupport') ? { hasOnContactSupport: hasCallback('onContactSupport') } : {}),
        ...(supportsCallback('onRecordSelection') ? { hasOnRecordSelection: hasCallback('onRecordSelection') } : {}),
        ...(supportsCallback('onShowDetails') ? { hasShowDetails: hasCallback('onShowDetails') } : {}),

        ...(supportsDataGrid && customColumns !== undefined ? { dataCustomColumns: customColumns } : {}),
        ...(supportsDataGrid || supportsDetails
            ? {
                  hasOnDataRetrieve: isFunction(dataGridCustomization.onDataRetrieve) || isFunction(detailsCustomization.onDataRetrieve),
              }
            : {}),
        ...(supportsDetails && hiddenDetailFields.length > 0 ? { hiddenDetailFields } : {}),

        // Payment Link creation only (fieldsConfig)
        ...(hasFieldsConfig
            ? {
                  fieldsPrefilled: Object.keys(asRecord(fieldsConfig.data)),
                  ...(fieldVisibility.readOnly.length > 0 ? { fieldsReadOnly: fieldVisibility.readOnly } : {}),
                  ...(fieldVisibility.hidden.length > 0 ? { fieldsHidden: fieldVisibility.hidden } : {}),
              }
            : {}),

        // How integrations scope data and paginate
        ...(capabilities.pagination
            ? {
                  allowLimitSelection: pagination.disableLimitSelection !== true,
                  hasPreferredLimit: pagination.defaultLimit !== undefined,
              }
            : {}),
        ...(capabilities.balanceAccountId
            ? { hasBalanceAccountId: typeof componentProps.balanceAccountId === 'string' && componentProps.balanceAccountId.length > 0 }
            : {}),
    };
};

export interface UpdatedThemeEventContext {
    /** Theme mode active before the runtime change. */
    previousThemeMode: ThemeMode | undefined;
    /** Theme mode applied by the runtime change. */
    themeMode: ThemeMode | undefined;
    /** Names of the components registered to the Core instance at the time of the change. */
    components: string[];
}

/**
 * Properties of the 'Updated theme (runtime)' event: the previous theme, the new theme,
 * and the components that were live when the integrator switched themes via core.update().
 */
export const getUpdatedThemeEventProperties = ({
    previousThemeMode,
    themeMode,
    components,
}: UpdatedThemeEventContext): Record<string, MixpanelProperty> => ({
    label: 'core',
    theme: themeMode ?? 'default',
    previousTheme: previousThemeMode ?? 'default',
    components,
});

/**
 * Encodes a core event with the base properties shared by the core-event family,
 * mirroring the payload shape of 'Customized translation'.
 */
const createCoreEventPayload = (
    event: CoreEventName,
    properties: Record<string, MixpanelProperty>,
    locale: string | undefined
): URLSearchParams | null =>
    encodeAnalyticsEvent({
        event,
        properties: {
            category: 'PIE',
            subCategory: 'Core',
            locale: locale ?? 'en-US',
            sdkVersion: process.env.SDK_VERSION,
            userAgent: getUserAgent(),
            time: getEventTime(),
            $insert_id: getEventInsertId(),
            ...properties,
        },
    });

/** Encoded 'Initiated core' event, queued on the session until the setup endpoint resolves. */
export const getInitiatedCoreEventPayload = (options: CoreOptions<any>): URLSearchParams | null =>
    createCoreEventPayload(CORE_EVENT_NAMES.initiatedCore, getInitiatedCoreEventProperties(options), options.locale);

/**
 * Encoded 'Customized component style' and 'Customized component data' events,
 * fired once per component mount.
 */
export const getCustomizedComponentEventPayloads = (context: ComponentEventContext & { locale?: string }): (URLSearchParams | null)[] => {
    const { componentName, appearance, componentProps, locale } = context;
    const styleEventContext: ComponentEventContext = { componentName, appearance, componentProps };
    const dataEventContext: ComponentDataEventContext = {
        componentName,
        componentProps,
    };

    return [
        createCoreEventPayload(CORE_EVENT_NAMES.customizedComponentStyle, getCustomizedComponentStyleEventProperties(styleEventContext), locale),
        createCoreEventPayload(CORE_EVENT_NAMES.customizedComponentData, getCustomizedComponentDataEventProperties(dataEventContext), locale),
    ];
};

/** Encoded 'Updated theme (runtime)' event, sent on each runtime theme change. */
export const getUpdatedThemeEventPayload = (context: UpdatedThemeEventContext & { locale?: string }): URLSearchParams | null =>
    createCoreEventPayload(CORE_EVENT_NAMES.updatedTheme, getUpdatedThemeEventProperties(context), context.locale);
