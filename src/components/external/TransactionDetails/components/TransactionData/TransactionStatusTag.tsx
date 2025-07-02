import useCoreContext from '../../../../../core/Context/useCoreContext';
import { ITransaction } from '../../../../../types';
import { Tag } from '../../../../internal/Tag/Tag';
import { TagVariant } from '../../../../internal/Tag/types';
import { RefundedState, RefundType } from '../../context/types';
import { TX_DATA_TAGS } from '../constants';
import { getRefundTypeForTransaction } from '../utils';

const TransactionStatusTag = ({ transaction, refundedState }: { transaction: ITransaction; refundedState: RefundedState }) => {
    const { i18n } = useCoreContext();
    const { category } = transaction;

    const refundType = getRefundTypeForTransaction(transaction);

    return (
        <div className={TX_DATA_TAGS}>
            {/*{status && <Tag label={i18n.get(status)} variant={getTagVariantForTransaction(transaction)} />}*/}
            {category && <Tag label={i18n.get(`txType.${category}`)} variant={TagVariant.DEFAULT} />}

            {/* refund type: only available for transaction.category == Refund */}
            {refundType && (
                <>
                    {refundType === RefundType.FULL && <Tag label={i18n.get('full')} variant={TagVariant.SUCCESS} />}
                    {refundType === RefundType.PARTIAL && <Tag label={i18n.get('partial')} variant={TagVariant.BLUE} />}
                </>
            )}

            {refundedState === RefundedState.FULL && <Tag label={i18n.get('refunded.full')} variant={TagVariant.SUCCESS} />}
            {refundedState === RefundedState.PARTIAL && <Tag label={i18n.get('refunded.partial')} variant={TagVariant.BLUE} />}
        </div>
    );
};

export default TransactionStatusTag;
