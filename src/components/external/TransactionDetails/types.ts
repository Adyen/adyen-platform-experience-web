import type { StrictUnion } from '../../../utils/types';
import type { IBalanceAccountBase, ILineItem, ITransactionWithDetails } from '../../../types';
import { CustomDataObject } from '../../types';

export interface DetailsWithoutIdProps {
    data: TransactionDetailData;
}

export interface DetailsWithIdProps {
    id: string;
}

export interface DetailsWithExtraData {
    extraDetails?: CustomDataObject; // use customdataobject
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
    extraFields: CustomDataObject | undefined; // use customdataobject
}
