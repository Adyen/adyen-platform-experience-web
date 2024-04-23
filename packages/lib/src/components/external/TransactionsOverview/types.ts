import { TransactionDetailData } from '@src/components';

export type OnSelection = (selection: { id: string; showModal: () => void }) => any;

export interface BalanceAccountProps {
    balanceAccountDescription?: string;
}

export type DetailsOptions = {
    transaction?: boolean;
};
export type SelectedDetail = {
    data: string | TransactionDetailData;
};
