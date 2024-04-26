import { InstantIdVerificationTokenResponse } from '../../src/core/models/api/instant-id-verification';

export const instantIdVerificationMock: InstantIdVerificationTokenResponse = {
    id: 'instantIdVerificationTokenId',
    operationStatus: {
        status: 'success',
    },
    sdkToken: 'instantIdVerificationRandomToken',
};
