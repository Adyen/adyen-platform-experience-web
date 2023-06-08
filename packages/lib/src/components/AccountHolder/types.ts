import { UIElementProps } from '../types';

export interface AccountHolderDetailsProps extends UIElementProps {
    accountHolder: {
        balancePlatform: string;
        description: string;
        legalEntityId: string;
        reference: string;
        capabilities: {
            receiveFromPlatformPayments: {
                enabled: boolean;
                requested: boolean;
                allowed: boolean;
                verificationStatus: string;
            };
            receiveFromBalanceAccount: {
                enabled: boolean;
                requested: boolean;
                allowed: boolean;
                verificationStatus: string;
            };
            sendToBalanceAccount: {
                enabled: boolean;
                requested: boolean;
                allowed: boolean;
                verificationStatus: string;
            };
            sendToTransferInstrument: {
                enabled: boolean;
                requested: boolean;
                allowed: boolean;
                verificationStatus: string;
            };
        };
        id: string;
        status: string;
        contactDetails: {
            address: { city: string; country: string; houseNumberOrName: string; postalCode: string; street: string };
            email: string;
            phone: { number: string; type: string };
        };
    };
    onChange?: (newState: Record<any, any>) => void;
}
