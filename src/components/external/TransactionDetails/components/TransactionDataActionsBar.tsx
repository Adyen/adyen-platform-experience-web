import { useMemo } from 'preact/hooks';
import { TX_DATA_CONTAINER, TX_DATA_CONTAINER_NO_PADDING } from '../constants';
import useTransactionDataContext from '../context';
import ButtonActions from '../../../internal/Button/ButtonActions/ButtonActions';
import { ButtonActionsLayoutBasic } from '../../../internal/Button/ButtonActions/types';

const TransactionDataActionsBar = () => {
    const { viewActions } = useTransactionDataContext();
    return useMemo(
        () =>
            viewActions.length ? (
                <div className={`${TX_DATA_CONTAINER} ${TX_DATA_CONTAINER_NO_PADDING}`}>
                    <ButtonActions actions={viewActions} layout={ButtonActionsLayoutBasic.BUTTONS_END} />
                </div>
            ) : null,
        [viewActions]
    );
};

export default TransactionDataActionsBar;
