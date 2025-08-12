import { Meta } from '@storybook/preact';
import { DisputeManagement } from '../../src';
import { DisputeManagementMeta } from '../components/disputeManagement';
import { ElementProps, ElementStory } from '../utils/types';
import { DISPUTE_DETAILS_HANDLERS } from '../../mocks/mock-server/disputes';

const meta: Meta<ElementProps<typeof DisputeManagement>> = { ...DisputeManagementMeta, title: 'Mocked/Dispute Management' };

export const Default: ElementStory<typeof DisputeManagement> = {
    name: 'Default',
    args: {
        mockedApi: true,
    },
};

// export const ChargebackAcceptable: ElementStory<typeof DisputeManagement> = {
//     name: 'Chargeback - Acceptable',
//     args: {
//         mockedApi: true,
//     },
//     parameters: {
//         msw: {
//             ...DISPUTE_DETAILS_HANDLERS.chargebackAcceptable,
//         },
//     },
// };

// export const ChargebackDefendable: ElementStory<typeof DisputeManagement> = {
//     name: 'Chargeback - Defendable',
//     args: {
//         mockedApi: true,
//     },
//     parameters: {
//         msw: {
//             ...DISPUTE_DETAILS_HANDLERS.chargebackDefendable,
//         },
//     },
// };

export const ChargebackDefendableExternally: ElementStory<typeof DisputeManagement> = {
    name: 'Chargeback - Defendable externally',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTE_DETAILS_HANDLERS.chargebackDefendableExternally,
        },
    },
};

// export const ChargebackLost: ElementStory<typeof DisputeManagement> = {
//     name: 'Chargeback - Lost',
//     args: {
//         mockedApi: true,
//     },
//     parameters: {
//         msw: {
//             ...DISPUTE_DETAILS_HANDLERS.chargebackLost,
//         },
//     },
// };

export const ChargebackLostWithIssuerFeedback: ElementStory<typeof DisputeManagement> = {
    name: 'Chargeback - Lost (with issuer feedback)',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTE_DETAILS_HANDLERS.chargebackLostWithFeedback,
        },
    },
};

export const ChargebackLostNotDefended: ElementStory<typeof DisputeManagement> = {
    name: 'Chargeback - Lost (not defended)',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTE_DETAILS_HANDLERS.chargebackLostNotDefended,
        },
    },
};

// export const ChargebackDefended: ElementStory<typeof DisputeManagement> = {
//     name: 'Chargeback - Defended',
//     args: {
//         mockedApi: true,
//     },
//     parameters: {
//         msw: {
//             ...DISPUTE_DETAILS_HANDLERS.chargebackDefended,
//         },
//     },
// };

export const ChargebackAutoDefended: ElementStory<typeof DisputeManagement> = {
    name: 'Chargeback - Auto defended',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTE_DETAILS_HANDLERS.chargebackAutoDefended,
        },
    },
};

export const ChargebackNotDefendable: ElementStory<typeof DisputeManagement> = {
    name: 'Chargeback - Not defendable',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTE_DETAILS_HANDLERS.chargebackNotDefendable,
        },
    },
};

export const RFIUnresponded: ElementStory<typeof DisputeManagement> = {
    name: 'RFI - Unresponded',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTE_DETAILS_HANDLERS.rfiUnresponded,
        },
    },
};

// export const RFIExpired: ElementStory<typeof DisputeManagement> = {
//     name: 'RFI - Expired',
//     args: {
//         mockedApi: true,
//     },
//     parameters: {
//         msw: {
//             ...DISPUTE_DETAILS_HANDLERS.rfiExpired,
//         },
//     },
// };

// export const RFIAcceptable: ElementStory<typeof DisputeManagement> = {
//     name: 'RFI - Acceptable',
//     args: {
//         mockedApi: true,
//     },
//     parameters: {
//         msw: {
//             ...DISPUTE_DETAILS_HANDLERS.rfiAcceptable,
//         },
//     },
// };

// export const RFIAccepted: ElementStory<typeof DisputeManagement> = {
//     name: 'RFI - Accepted',
//     args: {
//         mockedApi: true,
//     },
//     parameters: {
//         msw: {
//             ...DISPUTE_DETAILS_HANDLERS.rfiAccepted,
//         },
//     },
// };

export const NotificationOfFraud: ElementStory<typeof DisputeManagement> = {
    name: 'Notification of fraud',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTE_DETAILS_HANDLERS.notificationOfFraud,
        },
    },
};

export const ServerError: ElementStory<typeof DisputeManagement> = {
    name: 'Error - Server error',
    args: {
        mockedApi: true,
        onContactSupport: undefined,
    },
    parameters: {
        msw: {
            ...DISPUTE_DETAILS_HANDLERS.internalServerError,
        },
    },
};

export const NetworkError: ElementStory<typeof DisputeManagement> = {
    name: 'Error - Network error',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTE_DETAILS_HANDLERS.networkError,
        },
    },
};

export const UnprocessableEntityError: ElementStory<typeof DisputeManagement> = {
    name: 'Error - Unprocessable entity',
    args: {
        mockedApi: true,
        onContactSupport: undefined,
    },
    parameters: {
        msw: {
            ...DISPUTE_DETAILS_HANDLERS.unprocessableEntityError,
        },
    },
};

export const DownloadEvidenceError: ElementStory<typeof DisputeManagement> = {
    name: 'Error - Download evidence',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTE_DETAILS_HANDLERS.downloadServerError,
        },
    },
};

export const DefenseServerError: ElementStory<typeof DisputeManagement> = {
    name: 'Error - Defense server error',
    args: {
        mockedApi: true,
    },
    parameters: {
        msw: {
            ...DISPUTE_DETAILS_HANDLERS.defendServerError,
        },
    },
};

export default meta;
