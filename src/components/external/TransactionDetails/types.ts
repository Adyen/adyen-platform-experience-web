import type { StrictUnion } from '../../../utils/types';
import type { IBalanceAccountBase, ILineItem, ITransactionWithDetails } from '../../../types';
import { TX_DETAILS_RESERVED_FIELDS_SET } from './components/constants';
import { CustomDataRetrieved, DataCustomizationObject } from '../../types';

export interface DetailsWithoutIdProps {
    data: TransactionDetailData;
}

export interface DetailsWithIdProps {
    id: string;
}

export interface DetailsWithExtraData {
    dataCustomization?: any;
    extraDetails?: Record<string, any>;
}

export type DetailsComponentProps = StrictUnion<DetailsWithoutIdProps | DetailsWithIdProps> & DetailsWithExtraData;

export type TransactionDetailData = ITransactionWithDetails & BalanceAccountProps;

export interface BalanceAccountProps {
    balanceAccount?: IBalanceAccountBase;
}

export interface TransactionDataProps {
    error?: boolean;
    isFetching?: boolean;
    transaction?: TransactionDetailData & { lineItems?: ILineItem[] };
    dataCustomization?: { details: DataCustomizationObject<TransactionDetailsFields, TransactionDetailData, CustomDataRetrieved> };
    extraFields: Record<string, any> | undefined;
}

const _fields = [...TX_DETAILS_RESERVED_FIELDS_SET];

export type TransactionDetailsFields = (typeof _fields)[number];
