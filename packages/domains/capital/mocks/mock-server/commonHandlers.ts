import { http } from 'msw';
import { AdyenPlatformExperienceError, ErrorTypes } from '@integration-components/core';
import { CAPITAL_ENDPOINTS } from '../endpoints';
import { getErrorResponse } from './utils';

export const commonHandlers = {
    errorOfferConfig: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, '825ac4ce59f0f159ad672d38d3291i55', 'Message', '30_016');
            return getErrorResponse(error, 422);
        }),
    ],
    errorAccountHolder: [
        http.get(CAPITAL_ENDPOINTS.capitalState, () => {
            const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, '769ac4ce59f0f159ad672d38d3291e92', 'Message', '30_011');
            return getErrorResponse(error, 422);
        }),
    ],
};
