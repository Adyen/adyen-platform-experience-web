import { describe, test, expect } from 'vitest';
import { Content, getDefenseDocumentContent, getDefenseReasonContent } from './index';
import Localization from '../../../../../core/Localization';
import defenseDocumentContent from '../../../../../config/disputes/defenseDocumentConfig.json';
import defenseReasonContent from '../../../../../config/disputes/defenseReasonConfig.json';

const localization = new Localization();

describe('getDefenseDocumentContent', () => {
    test("should return undefined if the defense document key doesn't exist", () => {
        const result = getDefenseDocumentContent(defenseDocumentContent, localization.i18n, 'KeyThatDoesNotExist');
        expect(result).toBeUndefined();
    });

    test('should return the right content for defense document with "title" field', () => {
        const result = getDefenseDocumentContent(defenseDocumentContent, localization.i18n, 'ChargebackCodeNotApplicable');
        expect(result).toEqual<Content>({
            title: 'Documentation to support that the chargeback code is not applicable',
        });
    });

    test('should return the right content for defense document with "title" field and "help" field of "string" type', () => {
        const result = getDefenseDocumentContent(defenseDocumentContent, localization.i18n, 'AcquirerMemberMessageText');
        expect(result).toEqual<Content>({
            title: 'Clearing Text',
            primaryDescriptionItems: ['A description of the dispute reason'],
        });
    });

    test('should return the right content for defense document with "title", "help", and "helpitems" fields', () => {
        const result = getDefenseDocumentContent(defenseDocumentContent, localization.i18n, 'CardholderIdentification');
        expect(result).toEqual<Content>({
            title: 'Compelling Evidence of Card holder Participation',
            primaryDescriptionItems: ['Documentation proving the card holder participated in the transacion. This can be:'],
            secondaryDescriptionItems: [
                'A receipt, work order, or other document signed by the customer substantiating that the goods or services were received by the customer.',
                "The customer's written confirmation of registration to receive electronic delivery of goods or services.",
                'Copies of written correspondence exchanged between the merchant and the customer (such as letter, email, or fax) showing that the customer participated in the transaction.',
            ],
        });
    });
});

describe('getDefenseReasonContent', () => {
    test("should return undefined if the defense reason key doesn't exist", () => {
        const result = getDefenseReasonContent(defenseReasonContent, localization.i18n, 'KeyThatDoesNotExist');
        expect(result).toBeUndefined();
    });

    test('should return the right content for defense reason with "title" field', () => {
        const result = getDefenseReasonContent(defenseReasonContent, localization.i18n, 'CardPresentFraud');
        expect(result).toEqual<Content>({
            title: 'Card Present Fraud Evidence',
        });
    });

    test('should return the right content for defense reason with "title" field and "help" field of "string" type', () => {
        const result = getDefenseReasonContent(defenseReasonContent, localization.i18n, 'ATMDispute');
        expect(result).toEqual<Content>({
            title: 'ATM Dispute',
            primaryDescriptionItems: ['Invalid chargeback reason code for E-commerce/ POS payment'],
        });
    });

    test('should return the right content for defense reason with "title" field and "help" field of "array" type', () => {
        const result = getDefenseReasonContent(defenseReasonContent, localization.i18n, 'IdentifiedAddendum');
        expect(result).toEqual<Content>({
            title: 'Identified Addendum',
            primaryDescriptionItems: [
                'Merchants may remedy the dispute with documentation substantiating the cardholder has participated in the original transaction and documentation to establish the cardholder is responsible for the addendum transaction.',
                'The merchant also must include documentation substantiating that the cardholder is responsible for the disputed amount if the amount represents final audit charges not included in the original hotel/motel or vehicle cardholder billing.',
                'For example, after the cardholder initially is billed for a vehicle rental, the cardholder is billed for a separate additional amount that represents unpaid parking tickets. The cardholder claims that he or she did not authorize the transaction for the parking tickets. The merchant should provide information about the violations showing that they were issued during the period that the vehicle was rented by the cardholder, as well as the rental agreement with proof of card presence and signature authorizing such charges.',
            ],
        });
    });

    test('should return the right content for defense reason with "title", "help", and "helpitems" fields', () => {
        const result = getDefenseReasonContent(defenseReasonContent, localization.i18n, 'CancellationOrReturns');
        expect(result).toEqual<Content>({
            title: 'Cancellation or Returns',
            primaryDescriptionItems: ['Use this defense reason if one of the following is applicable:'],
            secondaryDescriptionItems: [
                'No credit slip or other advisement has been given to the card holder',
                'The cancellation of services or the return of the merchandise was not accepted.',
                'The merchandise was never returned',
            ],
        });
    });
});
