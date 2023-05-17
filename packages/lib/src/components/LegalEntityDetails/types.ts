import { UIElementProps } from '../types';

type VerificationStatus = 'pending' | 'invalid' | 'valid' | 'rejected';

type LegalEntityType = 'individual' | 'organization' | 'soleProprietorship';

type EntityType = 'BankAccount' | 'LegalEntity' | 'Documents';

type VerificationErrorType = 'dataMissing' | 'invalidInput' | 'pendingStatus';

type BusinessType =
    | 'other'
    | 'listedPublicCompany'
    | 'subsidiaryOfListedPublicCompany'
    | 'governmentalOrganization'
    | 'internationalOrganization'
    | 'financialInstitution';

type CompanyTypesValue =
    | 'privateCompany'
    | 'listedPublicCompany'
    | 'partnershipIncorporated'
    | 'associationIncorporated'
    | 'governmentalOrganization'
    | 'nonProfit'
    | 'soleProprietorship';

interface Phone {
    number: number;
    type: 'mobile' | 'landline' | 'sip' | 'fax';
}
interface VerificationError {
    code: string;
    message: string;
    type: VerificationErrorType;
    subErrors?: VerificationError[];
    remediatingActions?: VerificationError[];
}

interface Problem {
    entity: {
        id: string;
        type: EntityType;
        owner?: {
            id: string;
            type: EntityType;
        };
    };
    verificationErrors: VerificationError[];
}

interface Capability {
    enabled?: boolean;
    requested: boolean;
    allowed: boolean;
    problems?: Problem[];
    verificationStatus: VerificationStatus;
}

export default interface Address {
    city?: string;
    country?: string;
    postalCode?: string;
    stateOrProvince?: string;
    street?: string;
    street2?: string;
}

export type TaxInformationType = 'SSN' | 'EIN' | 'ITIN' | 'ABN';

type VatAbsenceReason = 'industryExemption' | 'belowTaxThreshold';

export type TaxInformation = {
    country: string;
    number: string;
    type: TaxInformationType;
};

type LegalEntityAssociation<Type> = {
    jobTitle?: string;
    legalEntityId: string;
    name?: string;
    entityType?: LegalEntityType;
    associatorId?: string;
} & Type;

interface Individual {
    birthData?: {
        dateOfBirth: string;
    };
    email?: string;
    identificationData?: {
        issuerState?: string;
        nationalIdExempt: boolean;
        number?: string;
        type?: string;
        cardNumber?: string;
    };
    name: {
        firstName: string;
        infix?: string;
        lastName: string;
    };
    nationality?: string;
    phone?: Phone;
    residentialAddress: Address;
}
interface Organization {
    legalName: string;
    registeredAddress: Address;
    dateOfIncorporation?: string;
    description?: string;
    doingBusinessAs?: string;
    email?: string;
    phone?: Phone;
    principalPlaceOfBusiness?: Address;
    registrationNumber?: string;
    stockData?: {
        marketIdentifier: string;
        stockNumber: string;
        tickerSymbol: string;
    };
    taxInformation?: TaxInformation[];
    taxReportingClassification?: {
        businessType?: BusinessType;
        financialInstitutionNumber?: string;
        mainSourceOfIncome?: 'businessOperation' | 'realEstateSales' | 'investmentInterestOrRoyalty' | 'propertyRental' | 'other';
        type?: 'nonFinancialNonReportable' | 'financialNonReportable' | 'nonFinancialActive' | 'nonFinancialPassive';
    };
    vatNumber?: string;
    vatAbsenceReason?: VatAbsenceReason;
    type?: CompanyTypesValue;
}

interface SoleProprietor {
    name: string;
    doingBusinessAs: string;
    countryOfGoverningLaw: string;
    taxInformation: TaxInformation[];
    vatNumber: string;
    vatAbsenceReason: VatAbsenceReason;
    registrationNumber: string;
    registeredAddress: Address;
    principalPlaceOfBusiness: Address;
}
type LEAssociationOrgType = { type: 'uboThroughOwnership' | 'uboThroughControl' | 'signatory' | 'ultimateParentCompany' };
type LEAssociationSoleProprietorType = { type: 'soleProprietorship' };

export type TransferInstrumentOverview = { accountIdentifier?: string; id: string; realLastFour?: string; trustedSource: boolean };
export interface BankAccount {
    accountNumber: string;
    accountType: string;
    bankBicSwift: string;
    bankCode?: string;
    bankName: string;
    branchCode: string;
    checkCode?: string;
    bankCity?: string;
    countryCode: string;
    currencyCode: string;
    iban?: string;
    realLastFour?: string;
    virtualAccountNumber?: boolean;
    trustedSource?: boolean;
}
export interface TransferInstrument {
    id: string;
    legalEntityId: string;
    bankAccount: BankAccount;
    type: 'bankAccount';
    documentDetails?: {
        id: string;
    }[];
}
interface LegalEntity {
    id: string;
    type: LegalEntityType;
    documentDetails?: {
        id: string;
    }[];
    capabilities?: { [key: string]: Capability };
    reference?: string;
    problems?: Problem[];
    transferInstruments?: TransferInstrumentOverview[];
}

export interface LegalEntityOrganization extends LegalEntity {
    type: 'organization';
    organization: Organization;
    entityAssociations?: LegalEntityAssociation<LEAssociationOrgType>[];
}
export interface LegalEntityIndividual extends LegalEntity {
    type: 'individual';
    individual: Individual;
}
export interface LegalEntitySoleProprietor extends LegalEntity {
    type: 'soleProprietorship';
    soleProprietorship: SoleProprietor;
    entityAssociations?: LegalEntityAssociation<LEAssociationSoleProprietorType>[];
}

export interface LegalEntityDetailsProps extends UIElementProps {
    legalEntity: LegalEntityOrganization | LegalEntityIndividual | LegalEntitySoleProprietor;
    onGetTransferInstrument?: GetTransferInstrumentById;
}

export type GetTransferInstrumentById = (id: string) => Promise<TransferInstrument>;
