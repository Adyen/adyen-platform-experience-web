import type { StatusType } from '../../../components/internal/Status/types';
import type { Capabilities } from '../capabilities';

export interface AccountHolder {
    balancePlatform: string;
    description: string;
    legalEntityId: string;
    reference?: string;
    capabilities: Capabilities;
    id: string;
    status: StatusType;
    contactDetails: {
        address: { city: string; country: string; houseNumberOrName: string; postalCode: string; street: string };
        email: string;
        phone: { number: string; type: string };
    };
}
