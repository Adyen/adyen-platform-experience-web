import { describe, expect, it, vi } from 'vitest';
import { COMMON_CAPITAL_ERROR_MESSAGE, getCapitalErrorMessage } from './getCapitalErrorMessage';
import AdyenPlatformExperienceError from '../../../core/Errors/AdyenPlatformExperienceError';
import { ErrorTypes } from '../../../core/Http/utils';

const UNDEFINED_ERROR = {
    title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
    message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, COMMON_CAPITAL_ERROR_MESSAGE.tryRefreshingThePage],
    refreshComponent: true,
};

describe('getCapitalErrorMessage', () => {
    it('should return UNDEFINED_ERROR with refreshComponent true when error.errorCode is undefined', () => {
        const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'requestId123', 'Test error message');
        error.errorCode = undefined;

        const result = getCapitalErrorMessage(error);

        expect(result).toEqual({
            ...UNDEFINED_ERROR,
            refreshComponent: true,
        });
    });

    it('should return UNDEFINED_ERROR when error.errorCode is unknown', () => {
        const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'requestId123', 'Test error message', 'unknown_code');

        const result = getCapitalErrorMessage(error);

        expect(result).toEqual(UNDEFINED_ERROR);
    });

    it('should return specific ErrorMessage when error.errorCode is "30_016"', () => {
        const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'requestId123', 'Test error message', '30_016');

        const mockOnContactSupport = vi.fn();

        const result = getCapitalErrorMessage(error, mockOnContactSupport);

        expect(result.title).toEqual(COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong);
        expect(result.message).toEqual([COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, 'common.errors.errorCode']);
        expect(result.onContactSupport).toEqual(mockOnContactSupport);
    });

    it('should return specific ErrorMessage when error.errorCode is "30_011"', () => {
        const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'requestId123', 'Test error message', '30_011');

        const mockOnContactSupport = vi.fn();

        const result = getCapitalErrorMessage(error, mockOnContactSupport);

        expect(result.title).toEqual('capital.offer.common.errors.accountInactive');
        expect(result.message).toEqual([COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, 'common.errors.errorCode']);
        expect(result.onContactSupport).toEqual(mockOnContactSupport);
    });

    it('should return ErrorMessage from getCommonErrorMessage for error code "29_001"', () => {
        const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'requestId123', 'Test error message', '29_001');

        const result = getCapitalErrorMessage(error);

        expect(result).toEqual({
            title: 'common.errors.requestInvalid',
            message: ['common.errors.contactSupport'],
        });
    });
});
