import { GetConfigurationResponse } from './api/get-configuration';
import { Scenarios } from './api/get-scenarios';
import { bankVerificationProviders } from './bankVerificationProviders';
import { TaskTypes } from './api/types';

export const supportedCountries: { countries: any[] } = {
    countries: [
        'AT',
        'AU',
        'BE',
        'BG',
        'BR',
        'CA',
        'CH',
        'CY',
        'CZ',
        'DE',
        'DK',
        'EE',
        'ES',
        'FI',
        'FR',
        'GB',
        'GG',
        'GI',
        'GR',
        'HK',
        'HR',
        'HU',
        'IE',
        'IM',
        'IT',
        'JE',
        'LI',
        'LT',
        'LU',
        'LV',
        'MC',
        'MT',
        'NL',
        'NO',
        'NZ',
        'PL',
        'PR',
        'PT',
        'RO',
        'SE',
        'SG',
        'SI',
        'SK',
        'US',
    ],
};

export const supportedLocales = {
    locales: [
        'bg-BG',
        'cs-CZ',
        'da-DK',
        'de-DE',
        'el-GR',
        'en-US',
        'es-ES',
        'et-EE',
        'fi-FI',
        'fr-FR',
        'hr-HR',
        'hu-HU',
        'it-IT',
        'lt-LT',
        'lv-LV',
        'nl-NL',
        'no-NO',
        'pl-PL',
        'pt-PT',
        'ro-RO',
        'sk-SK',
        'sl-SI',
        'sv-SE',
    ],
};

export const MOCK_CONFIGURATION_INDIVIDUAL_US: GetConfigurationResponse = {
    matchingScenario: { individual: [Scenarios.L1_ID] },
    taskList: [TaskTypes.SERVICE_AGREEMENT, TaskTypes.PAYOUT, TaskTypes.PAYIN, TaskTypes.INDIVIDUAL, TaskTypes.PCI_DSS],
    bankVerificationProviders,
};

export const MOCK_CONFIGURATION_INDIVIDUAL_NL: GetConfigurationResponse = {
    matchingScenario: {
        individual: [Scenarios.L1_ID],
    },
    taskList: [TaskTypes.PAYOUT, TaskTypes.INDIVIDUAL, TaskTypes.PCI_DSS],
    bankVerificationProviders,
};

export const MOCK_CONFIGURATION_COMPANY_L1: GetConfigurationResponse = {
    matchingScenario: {
        organization: [Scenarios.L1],
    },
    taskList: [TaskTypes.PAYOUT, TaskTypes.DECISION_MAKER, TaskTypes.COMPANY, TaskTypes.PAYIN, TaskTypes.PCI_DSS],
    bankVerificationProviders,
};

export const MOCK_CONFIGURATION_COMPANY_L: GetConfigurationResponse = {
    matchingScenario: {
        organization: [Scenarios.L],
    },
    taskList: [TaskTypes.PAYOUT, TaskTypes.DECISION_MAKER, TaskTypes.COMPANY, TaskTypes.PAYIN, TaskTypes.PCI_DSS],
    bankVerificationProviders,
};

export const MOCK_CONFIGURATION_COMPANY_L_REG_DOC: GetConfigurationResponse = {
    matchingScenario: {
        organization: [Scenarios.L, Scenarios.L_REGDOC],
    },
    taskList: [TaskTypes.PAYOUT, TaskTypes.DECISION_MAKER, TaskTypes.COMPANY, TaskTypes.PAYIN, TaskTypes.PCI_DSS],
    bankVerificationProviders,
};

export const MOCK_CONFIGURATION_COMPANY_L_TAX_DOC: GetConfigurationResponse = {
    matchingScenario: {
        organization: [Scenarios.L, Scenarios.L_TAXDOC],
    },
    taskList: [TaskTypes.PAYOUT, TaskTypes.DECISION_MAKER, TaskTypes.COMPANY, TaskTypes.PAYIN, TaskTypes.PCI_DSS],
    bankVerificationProviders,
};

export const MOCK_CONFIGURATION_COMPANY_L_ALL_DOCS: GetConfigurationResponse = {
    matchingScenario: {
        organization: [Scenarios.L, Scenarios.L_REGDOC, Scenarios.L_TAXDOC],
    },
    taskList: [TaskTypes.PAYOUT, TaskTypes.DECISION_MAKER, TaskTypes.COMPANY, TaskTypes.PAYIN, TaskTypes.PCI_DSS],
    bankVerificationProviders,
};

export const MOCK_CONFIGURATION_COMPANY_L1_HU: GetConfigurationResponse = {
    matchingScenario: {
        organization: [Scenarios.L1, Scenarios.L_REGDOC, Scenarios.L_TAXDOC],
    },
    taskList: [TaskTypes.DECISION_MAKER, TaskTypes.PAYOUT, TaskTypes.COMPANY, TaskTypes.PCI_DSS],
    bankVerificationProviders,
};

export const MOCK_CONFIGURATION_TRUST_L: GetConfigurationResponse = {
    matchingScenario: {
        trust: [Scenarios.L],
    },
    taskList: [TaskTypes.PAYOUT, TaskTypes.DECISION_MAKER, TaskTypes.COMPANY, TaskTypes.PAYIN, TaskTypes.PCI_DSS],
    bankVerificationProviders,
};

export const MOCK_CONFIGURATION_SOLEPROPRIETORSHIP_L: GetConfigurationResponse = {
    matchingScenario: {
        soleProprietorship: [Scenarios.L],
    },
    taskList: [TaskTypes.PAYOUT, TaskTypes.PAYIN, TaskTypes.PCI_DSS],
    bankVerificationProviders,
};

export const NOT_AUTHORIZED = {
    type: 'https://docs.adyen.com/development-resources/error-codes',
    title: 'Unauthorized',
    status: 401,
    errorCode: '00_401',
};

export const MOCK_EMBEDDED_CONFIGURATION_TASKS: TaskTypes[] = [TaskTypes.PAYOUT, TaskTypes.DECISION_MAKER, TaskTypes.COMPANY, TaskTypes.PAYIN];
