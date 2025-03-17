import type { StrictUnion } from '../../../utils/types';
import { IBalanceAccountBase, ILineItem, ITransactionWithDetails } from '../../../types';
import { TX_DETAILS_RESERVED_FIELDS_SET } from './components/constants';
import { CustomDataRetrieved, DataCustomizationObject } from '../../types';

export interface DetailsWithoutIdProps {
    data: TransactionDetailData;
}

export interface DetailsWithIdProps {
    id: string;
}

export type TransactionDetailsCustomization = DataCustomizationObject<TransactionDetailsFields, TransactionDetailData, CustomDataRetrieved>;

export interface DetailsWithExtraData<T extends DataCustomizationObject<any, any, any>> {
    dataCustomization?: {
        details?: T;
    };
    extraDetails?: Record<string, any>;
}

export type DetailsComponentProps = StrictUnion<DetailsWithoutIdProps | DetailsWithIdProps>;

export type TransactionDetailData = ITransactionWithDetails & BalanceAccountProps;

export interface BalanceAccountProps {
    balanceAccount?: IBalanceAccountBase;
}

export interface TransactionDataProps {
    error?: boolean;
    isFetching?: boolean;
    transaction?: TransactionDetailData & { lineItems?: ILineItem[] };
    dataCustomization?: { details?: DataCustomizationObject<TransactionDetailsFields, TransactionDetailData, CustomDataRetrieved> };
    extraFields: Record<string, any> | undefined;
}

const _fields = [...TX_DETAILS_RESERVED_FIELDS_SET];

export type TransactionDetailsFields = (typeof _fields)[number];

export type TransactionDetailsProps = DetailsComponentProps & DetailsWithExtraData<TransactionDetailsCustomization>;
