import { ITransaction } from '../../../../../types';
import { Tag } from '../../../../internal/Tag/Tag';
import { TagVariant } from '../../../../internal/Tag/types';
import { RefundedState, RefundType } from '../../context/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { getTransactionCategory } from '../../../../utils/translation/getters';
import { getRefundTypeForTransaction } from '../utils';
import { TX_DATA_TAGS } from '../constants';

const TransactionStatusTag = ({ transaction, refundedState }: { transaction: ITransaction; refundedState: RefundedState }) => {
    const { i18n } = useCoreContext();
    const { category } = transaction;

    const refundType = getRefundTypeForTransaction(transaction);

    return (
        <div className={TX_DATA_TAGS}>
            {/*{status && <Tag label={getTransactionStatus(i18n, status)} variant={getTagVariantForTransaction(transaction)} />}*/}
            {category && <Tag label={getTransactionCategory(i18n, category)} variant={TagVariant.DEFAULT} />}

            {/* refund type: only available for transaction.category == Refund */}
            {refundType && (
                <>
                    {refundType === RefundType.FULL && (
                        <Tag label={i18n.get('transactions.details.common.refundTypes.full')} variant={TagVariant.SUCCESS} />
                    )}
                    {refundType === RefundType.PARTIAL && (
                        <Tag label={i18n.get('transactions.details.common.refundTypes.partial')} variant={TagVariant.BLUE} />
                    )}
                </>
            )}

            {refundedState === RefundedState.FULL && (
                <Tag label={i18n.get('transactions.details.common.refundedStates.full')} variant={TagVariant.SUCCESS} />
            )}
            {refundedState === RefundedState.PARTIAL && (
                <Tag label={i18n.get('transactions.details.common.refundedStates.partial')} variant={TagVariant.BLUE} />
            )}
        </div>
    );
};

export default TransactionStatusTag;
