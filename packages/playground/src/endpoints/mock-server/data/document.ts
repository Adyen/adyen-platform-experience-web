import { Document, DocumentType, ExistingDocument } from '../../src/core/models/api/document';
import { DocumentDetail } from '../../src/core/models/api/documentDetail';

export const mockDocuments: Document[] = [];

export const getDocumentResponse_Document_companyRegistrationDocument = (ownerId: string) => {
    const document: ExistingDocument = {
        id: `getDocumentResponse_Document_companyRegistrationDocument-${ownerId}`,
        type: DocumentType.REGISTRATION_DOCUMENT,
        description: 'Document type: registrationDocument',
        owner: { id: ownerId, type: 'legalEntity' },
        attachments: [{ content: 'fjaosj98172312jioscd', pageName: 'biz_reg_doc.png' }],
    };

    mockDocuments.push(document);
    return document;
};

export const getDocumentResponse_Document_companyTaxDocument = (ownerId: string) => {
    const document: ExistingDocument = {
        id: `getDocumentResponse_Document_companyTaxDocument-${ownerId}`,
        type: DocumentType.PROOF_OF_ORGANIZATION_TAX_INFO,
        description: 'Document type: proofOfOrganizationTaxInfo',
        owner: { id: ownerId, type: 'legalEntity' },
        attachments: [{ content: 'aaaosj98172312jioscd', pageName: 'biz_tax_doc.png' }],
    };

    mockDocuments.push(document);
    return document;
};

export const getDocumentResponse_Document_identityCard = (ownerId: string): Document => {
    const document: ExistingDocument = {
        id: `getDocumentResponse_Document_identityCard-${ownerId}`,
        type: DocumentType.IDENTITY_CARD,
        description: 'My test document',
        owner: {
            id: ownerId,
            type: 'legalEntity',
        },
        attachments: [
            {
                content: 'jklasjDJLKA2SD980=123',
                pageName: 'identity_card_back.jpg',
                pageType: 'back',
            },
            {
                content: 'R0lGODlhhAMKAeZOADs=',
                pageName: 'identity_card_front.png',
                pageType: 'front',
            },
        ],
    };

    mockDocuments.push(document);
    return document;
};

export const getDocumentResponse_Document_passport = (ownerId: string): Document => {
    const document: ExistingDocument = {
        id: `getDocumentResponse_Document_passport-${ownerId}`,
        type: DocumentType.PASSPORT,
        description: 'My test document',
        owner: {
            id: ownerId,
            type: 'legalEntity',
        },
        attachments: [
            {
                content: 'R0lGODlhhAMKAeZOADs=',
                pageName: 'passport.png',
            },
        ],
    };

    mockDocuments.push(document);
    return document;
};

export const getDocumentResponse_Document_proofOfResidency = (ownerId: string): Document => {
    const document: ExistingDocument = {
        id: `getDocumentResponse_Document_proofOfResidency-${ownerId}`,
        type: DocumentType.PROOF_OF_RESIDENCY,
        description: 'My proof that I can live here',
        owner: {
            id: ownerId,
            type: 'legalEntity',
        },
        attachments: [
            {
                content: 'R0lGODlhhAMKAeZOADs=',
                pageName: 'proofOfResidency.pdf',
            },
        ],
    };

    mockDocuments.push(document);
    return document;
};

export const getDocumentResponse_Document_proofOfNationalIdNumber = (ownerId: string): Document => {
    const document: ExistingDocument = {
        id: `getDocumentResponse_Document_proofOfNationalIdNumber-${ownerId}`,
        type: DocumentType.PROOF_OF_NATIONAL_ID_NUMBER,
        description: 'My proof that I can live here',
        owner: {
            id: ownerId,
            type: 'legalEntity',
        },
        attachments: [
            {
                content: 'R0lGODlhhAMKAeZOADs=',
                pageName: 'proofOfNationalIdNumber.pdf',
            },
        ],
    };

    mockDocuments.push(document);
    return document;
};

export const getDocumentResponse_Document_bankStatement = (ownerId: string): Document => {
    const document: ExistingDocument = {
        id: `getDocumentResponse_Document_bankStatement-${ownerId}`,
        type: DocumentType.BANK_STATEMENT,
        description: 'Document type: bankStatement',
        owner: { id: ownerId, type: 'bankAccount' },
        attachments: [{ content: 'fjaosj98172312jiosad', pageName: 'Screenshot 2023-03-09 at 16.00.20.png' }],
    };

    mockDocuments.push(document);

    return document;
};

export const getDocumentDetailForDocument = (document: Document, active = true): DocumentDetail => ({
    id: document.id as string,
    type: document.type,
    description: document.description,
    fileName: document.description,
    modificationDate: new Date(2022, 2, 4).toISOString(),
    active,
});
