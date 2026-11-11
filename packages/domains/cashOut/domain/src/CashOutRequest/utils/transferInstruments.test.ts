import { describe, expect, test } from 'vitest';
import type { ICashOutTransferInstrument, ICashOutTransferInstrumentIneligibilityReason } from '@integration-components/types';
import { getTransferInstrumentOptions } from './transferInstruments';

const transferInstrumentOf = (id: string, reason?: ICashOutTransferInstrumentIneligibilityReason) =>
    ({
        description: `Account ${id}`,
        eligible: !reason,
        ineligibilityReasons: reason ? [reason] : [],
        transferInstrumentId: id,
    }) as ICashOutTransferInstrument;

describe('getTransferInstrumentOptions', () => {
    test('should list eligible accounts first, keeping the order of the API within each group', () => {
        const options = getTransferInstrumentOptions(
            [
                transferInstrumentOf('TI1', 'noInstantTransferRoute'),
                transferInstrumentOf('TI2'),
                transferInstrumentOf('TI3', 'transferInstrumentCurrencyMismatch'),
                transferInstrumentOf('TI4'),
            ],
            'EUR'
        );

        expect(options.map(({ transferInstrumentId, eligible }) => [transferInstrumentId, eligible])).toEqual([
            ['TI2', true],
            ['TI4', true],
            ['TI1', false],
            ['TI3', false],
        ]);
    });

    test('should give an eligible account its description and no reason', () => {
        expect(getTransferInstrumentOptions([transferInstrumentOf('TI1')], 'EUR')).toEqual([
            { transferInstrumentId: 'TI1', description: 'Account TI1', eligible: true, ineligibilityReason: undefined },
        ]);
    });

    test('should give an account without an instant route the reason for it', () => {
        const [option] = getTransferInstrumentOptions([transferInstrumentOf('TI1', 'noInstantTransferRoute')], 'EUR');

        expect(option?.ineligibilityReason).toEqual({
            key: 'cashOut.request.fields.transferInstrument.ineligibilityReasons.noInstantTransferRoute',
            values: undefined,
        });
    });

    test('should name the currency of the cashOut for an account that cannot receive it', () => {
        const [option] = getTransferInstrumentOptions([transferInstrumentOf('TI1', 'transferInstrumentCurrencyMismatch')], 'EUR');

        expect(option?.ineligibilityReason).toEqual({
            key: 'cashOut.request.fields.transferInstrument.ineligibilityReasons.transferInstrumentCurrencyMismatch',
            values: { currency: 'EUR' },
        });
    });

    test('should give no reason for an account the account holder cannot send cashOuts to', () => {
        const [option] = getTransferInstrumentOptions([transferInstrumentOf('TI1', 'sendToTransferInstrumentNotAllowed')], 'EUR');

        expect(option).toMatchObject({ eligible: false, ineligibilityReason: undefined });
    });

    test('should not change the transfer instruments it is given', () => {
        const transferInstruments = [transferInstrumentOf('TI1', 'noInstantTransferRoute'), transferInstrumentOf('TI2')];

        getTransferInstrumentOptions(transferInstruments, 'EUR');

        expect(transferInstruments.map(({ transferInstrumentId }) => transferInstrumentId)).toEqual(['TI1', 'TI2']);
    });
});
