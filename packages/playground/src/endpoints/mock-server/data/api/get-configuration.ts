import type { GetScenariosResponse } from './get-scenarios';

export interface GetConfigurationRequest {
    country: any;
    capabilities?: string[];
    legalEntityType: any;
}

export interface GetConfigurationResponse {
    matchingScenario?: GetScenariosResponse;
    taskList?: any[];
    bankVerificationProviders?: any;
}
