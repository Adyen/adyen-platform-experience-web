import { Schema } from '../utils';
import { components as cashOutComponents } from '../resources/CashOutResourceV1';

export type ICashOutAmount = Schema<cashOutComponents, 'Amount'>;
export type ICashOutCounterparty = Schema<cashOutComponents, 'CounterpartyDTO'>;
export type ICashOutEligibility = Schema<cashOutComponents, 'CashOutEligibilityResponseDTO'>;
export type ICashOutFees = Schema<cashOutComponents, 'CashOutFeesResponseDTO'>;
export type ICashOutRequest = Schema<cashOutComponents, 'CashOutRequestDTO'>;
export type ICashOutResponse = Schema<cashOutComponents, 'CashOutResponseDTO'>;
export type ICashOutTransferInstrument = Schema<cashOutComponents, 'TransferInstrumentDTO'>;
export type ICashOutTransferInstrumentType = Schema<cashOutComponents, 'TransferInstrumentType'>;
export type ICashOutTransferInstrumentIneligibilityReason = Schema<cashOutComponents, 'TransferInstrumentIneligibilityReason'>;
export type ICashOutUnavailableReason = Schema<cashOutComponents, 'CashOutUnavailableReason'>;
