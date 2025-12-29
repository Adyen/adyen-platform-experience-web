import { boolOrFalse } from '../../../../../utils';
import { CustomColumn } from '../../../../types';
import { TX_DETAILS_RESERVED_FIELDS_SET } from '../../constants';
import DataOverviewDetailsSkeleton from '../../../../internal/DataOverviewDetails/DataOverviewDetailsSkeleton';
import TransactionDataContent from './TransactionDataContent';
import { TransactionDetailsProps } from '../../types';
import useTransaction from '../../hooks/useTransaction';
import { useModalContext } from '../../../../internal/Modal/Modal';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Header } from '../../../../internal/Header';
import { ErrorMessageDisplay } from '../../../../internal/ErrorMessageDisplay/ErrorMessageDisplay';
import { getErrorMessage } from '../../../../utils/getErrorMessage';
import AdyenPlatformExperienceError from '../../../../../core/Errors/AdyenPlatformExperienceError';

export const TransactionData = ({ id, dataCustomization, hideTitle, onContactSupport }: TransactionDetailsProps) => {
    const { error, fetchingTransaction, refreshTransaction, transaction, transactionNavigator } = useTransaction(id);
    const { withinModal } = useModalContext();

    const [extraFields, setExtraFields] = useState<Record<string, any>>();
    const [forcedHideTitle, setForcedHideTitle] = useState(false);

    const shouldHideTitle = useMemo(() => forcedHideTitle || boolOrFalse(hideTitle), [forcedHideTitle, hideTitle]);
    const initialTransaction = useRef(transaction);

    const errorProps = useMemo(
        () => getErrorMessage(error as AdyenPlatformExperienceError, 'transactions.details.errors.unavailable', onContactSupport),
        [error, onContactSupport]
    );

    if (!initialTransaction.current && transaction) {
        initialTransaction.current = transaction;
    }

    useEffect(() => {
        // ensure title is always hidden within transaction details modal
        setForcedHideTitle(withinModal);
    }, [withinModal]);

    useEffect(() => {
        if (transaction && transaction.id === id) {
            (async () => {
                const customizedDetails = await dataCustomization?.details?.onDataRetrieve?.(transaction);
                setExtraFields(
                    dataCustomization?.details?.fields.reduce((extraFields, field) => {
                        return !TX_DETAILS_RESERVED_FIELDS_SET.has(field.key as any) && field?.visibility !== 'hidden'
                            ? {
                                  ...extraFields,
                                  ...(customizedDetails?.[field.key] && { [field.key]: customizedDetails[field.key] }),
                              }
                            : extraFields;
                    }, {} as CustomColumn<any>)
                );
            })();
        } else setExtraFields(undefined);
    }, [transaction, id, dataCustomization]);

    return (
        <div className="adyen-pe-overview-details">
            <Header hideTitle={shouldHideTitle} titleKey="transactions.details.title" forwardedToRoot={!withinModal} />

            {initialTransaction.current ? (
                <TransactionDataContent
                    extraFields={extraFields}
                    dataCustomization={dataCustomization}
                    fetchingTransaction={fetchingTransaction}
                    refreshTransaction={refreshTransaction}
                    transaction={transaction ?? initialTransaction.current}
                    transactionNavigator={transactionNavigator}
                />
            ) : fetchingTransaction ? (
                <DataOverviewDetailsSkeleton skeletonRowNumber={5} />
            ) : (
                error &&
                errorProps && (
                    <div className="adyen-pe-overview-details--error-container">
                        <ErrorMessageDisplay withImage {...errorProps} />
                    </div>
                )
            )}
        </div>
    );
};
