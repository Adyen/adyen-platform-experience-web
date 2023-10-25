import type { TransferInstrumentOv } from '../transferInstrument';
import type { Problem } from '../verification';
import type { Capabilities } from '../capabilities';
import type { Address } from '../address';
import type { Phone } from '../phone';

export type TaxInformationType = 'SSN' | 'EIN' | 'ITIN' | 'ABN';

export type TaxInformation = {
    country: string;
    number: string;
    type: TaxInformationType;
};

export type LegalEntityType = 'individual' | 'organization' | 'soleProprietorship';

export type VatAbsenceReason = 'industryExemption' | 'belowTaxThreshold';

export type BusinessType =
    | 'other'
    | 'listedPublicCompany'
    | 'subsidiaryOfListedPublicCompany'
    | 'governmentalOrganization'
    | 'internationalOrganization'
    | 'financialInstitution';

export type CompanyTypesValue =
    | 'privateCompany'
    | 'listedPublicCompany'
    | 'partnershipIncorporated'
    | 'associationIncorporated'
    | 'governmentalOrganization'
    | 'nonProfit'
    | 'soleProprietorship';

export type LegalEntityAssociation<Type> = {
    jobTitle?: string;
    legalEntityId: string;
    name?: string;
    entityType?: LegalEntityType;
    associatorId?: string;
} & Type;

export interface IndividualLE {
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

export interface OrganizationLE {
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

export interface SoleProprietorLE {
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

export type LEAssociationOrgType = { type: 'uboThroughOwnership' | 'uboThroughControl' | 'signatory' | 'ultimateParentCompany' };
export type LEAssociationSoleProprietorType = { type: 'soleProprietorship' };

export interface LegalEntity {
    id: string;
    type: LegalEntityType;
    documentDetails?: {
        id: string;
    }[];
    capabilities?: Capabilities;
    reference?: string;
    problems?: Problem[];
    transferInstruments?: TransferInstrumentOv[];
}
export interface ILegalEntityOrganization extends LegalEntity {
    type: 'organization';
    organization: OrganizationLE;
    entityAssociations?: LegalEntityAssociation<LEAssociationOrgType>[];
}
export interface ILegalEntityIndividual extends LegalEntity {
    type: 'individual';
    individual: IndividualLE;
}
export interface ILegalEntitySoleProprietor extends LegalEntity {
    type: 'soleProprietorship';
    soleProprietorship: SoleProprietorLE;
    entityAssociations?: LegalEntityAssociation<LEAssociationSoleProprietorType>[];
}

export type LegalEntities = ILegalEntityOrganization | ILegalEntityIndividual | ILegalEntitySoleProprietor;
