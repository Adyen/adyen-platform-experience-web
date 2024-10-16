import { describe, expect, it, vi } from 'vitest';
import { COMMON_CAPITAL_ERROR_MESSAGE, getCapitalErrorMessage } from './getCapitalErrorMessage'; // Update the path accordingly
import AdyenPlatformExperienceError from '../../../core/Errors/AdyenPlatformExperienceError';
import { UNDEFINED_ERROR } from '../getCommonErrorCode';
import { ErrorTypes } from '../../../core/Http/utils';

describe('getCapitalErrorMessage', () => {
    it('should return UNDEFINED_ERROR when error is undefined', () => {
        const result = getCapitalErrorMessage(undefined);
        expect(result).toEqual(UNDEFINED_ERROR);
    });

    it('should return UNDEFINED_ERROR when errorCode is undefined', () => {
        const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'requestId123', 'Test error message');
        const result = getCapitalErrorMessage(error);

        expect(result).toEqual({
            ...UNDEFINED_ERROR,
            refreshComponent: true,
        });
    });

    it('should return UNDEFINED_ERROR with refreshComponent true when error.errorCode is undefined', () => {
        const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'requestId123', 'Test error message');
        error.errorCode = undefined;

        const result = getCapitalErrorMessage(error);

        expect(result).toEqual({
            ...UNDEFINED_ERROR,
            refreshComponent: true,
        });
    });

    it('should return specific ErrorMessage when error.errorCode is "01_422"', () => {
        const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'requestId123', 'Test error message', '01_422');

        const mockOnContactSupport = vi.fn();

        const result = getCapitalErrorMessage(error, mockOnContactSupport);

        expect(result).toEqual({
            title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
            message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, COMMON_CAPITAL_ERROR_MESSAGE.contactSupport],
            onContactSupport: mockOnContactSupport,
        });
    });

    it('should return specific ErrorMessage when error.errorCode is "02_422"', () => {
        const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'requestId123', 'Test error message', '02_422');

        const mockOnContactSupport = vi.fn();

        const result = getCapitalErrorMessage(error, mockOnContactSupport);

        expect(result).toEqual({
            title: 'capital.accountIsNotActive',
            message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, COMMON_CAPITAL_ERROR_MESSAGE.contactSupport],
            onContactSupport: mockOnContactSupport,
        });
    });

    it('should return specific ErrorMessage when error.errorCode is "03_422"', () => {
        const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'requestId123', 'Test error message', '03_422');

        const mockOnContactSupport = vi.fn();

        const result = getCapitalErrorMessage(error, mockOnContactSupport);

        expect(result).toEqual({
            title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
            message: [COMMON_CAPITAL_ERROR_MESSAGE.couldNotLoadOffers, COMMON_CAPITAL_ERROR_MESSAGE.tryRefreshingThePage],
            onContactSupport: mockOnContactSupport,
        });
    });

    it('should return specific ErrorMessage when error.errorCode is "04_422"', () => {
        const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'requestId123', 'Test error message', '04_422');

        const mockOnContactSupport = vi.fn();

        const result = getCapitalErrorMessage(error, mockOnContactSupport);

        expect(result).toEqual({
            title: COMMON_CAPITAL_ERROR_MESSAGE.somethingWentWrong,
            message: ['capital.couldNotContinueWithTheOffer', COMMON_CAPITAL_ERROR_MESSAGE.contactSupport],
            onContactSupport: mockOnContactSupport,
        });
    });

    it('should return UNDEFINED_ERROR when error.errorCode is unknown', () => {
        const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'requestId123', 'Test error message', 'unknown_code');

        const result = getCapitalErrorMessage(error);

        expect(result).toEqual(UNDEFINED_ERROR);
    });

    it('should return ErrorMessage from getCommonErrorMessage for error code "29_001"', () => {
        const error = new AdyenPlatformExperienceError(ErrorTypes.ERROR, 'requestId123', 'Test error message', '29_001');

        const result = getCapitalErrorMessage(error);

        expect(result).toEqual({
            title: 'theRequestIsMissingRequiredFieldsOrContainsInvalidData',
            message: ['pleaseReachOutToSupportForAssistance'],
        });
    });
});
