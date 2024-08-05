import { useMemo } from 'preact/hooks';
import { Tag } from '../../../internal/Tag/Tag';
import { TagVariant } from '../../../internal/Tag/types';
import { getTagVariantForTransaction } from '../utils';
import { TX_DATA_SECTION, TX_DATA_TAG_CONTAINER } from '../constants';
import useCoreContext from '../../../../core/Context/useCoreContext';
import useTransactionDataContext from '../context';

const TransactionDataTags = () => {
    const { i18n } = useCoreContext();
    const { transaction } = useTransactionDataContext();

    return useMemo(() => {
        const { category, status } = transaction;
        return status || category ? (
            <div className={`${TX_DATA_SECTION} ${TX_DATA_TAG_CONTAINER}`}>
                {status && <Tag label={i18n.get(status)} variant={getTagVariantForTransaction(transaction)} />}
                {category && <Tag label={i18n.get(`txType.${category}`)} variant={TagVariant.DEFAULT} />}
            </div>
        ) : null;
    }, [i18n, transaction]);
};

export default TransactionDataTags;
