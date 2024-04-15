import { OnSelection } from '@src/components';
import { BASE_CLASS, SPINNER_CONTAINER_CLASS } from '@src/components/external/PayoutsOverview/components/PayoutsDisplay/constants';
import { PayoutsTable } from '@src/components/external/PayoutsOverview/components/PayoutsTable/PayoutsTable';
import Modal from '@src/components/internal/Modal';
import { PaginationProps, WithPaginationLimitSelection } from '@src/components/internal/Pagination/types';
import { popoverUtil } from '@src/components/internal/Popover/utils/popoverUtil';
import Spinner from '@src/components/internal/Spinner';
import useCoreContext from '@src/core/Context/useCoreContext';
import AdyenPlatformExperienceError from '@src/core/Errors/AdyenPlatformExperienceError';
import useModalDetails from '@src/hooks/useModalDetails/useModalDetails';
import { IBalanceAccountBase } from '@src/types';
import { FC, lazy, Suspense } from 'preact/compat';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import { BASIC_PAYOUTS_LIST } from '../../../../../../../../mocks/src/payouts';
import './PayoutsDisplay.scss';

const ModalContent = lazy(() => import('@src/components/external/TransactionsOverview/components/ModalContent'));

export interface PayoutsTableProps extends WithPaginationLimitSelection<PaginationProps> {
    balanceAccounts: IBalanceAccountBase[] | undefined;
    loading: boolean;
    error: AdyenPlatformExperienceError | undefined;
    onContactSupport?: () => void;
    onDataSelection?: OnSelection;
    showDetails?: boolean;
    showPagination: boolean;
    data: typeof BASIC_PAYOUTS_LIST | undefined;
    balanceAccountDescription?: string;
}
export const PayoutsDisplay: FC<PayoutsTableProps> = ({
    balanceAccountDescription,
    error,
    loading,
    onContactSupport,
    onDataSelection,
    showDetails,
    showPagination,
    data,
    ...paginationProps
}: PayoutsTableProps) => {
    const { i18n } = useCoreContext();

    const payoutDetails = useMemo(
        () => ({
            showDetails: showDetails ?? true,
            callback: onDataSelection,
        }),
        [showDetails, onDataSelection]
    );

    const modalOptions = useMemo(() => ({ payout: payoutDetails }), [payoutDetails]);

    const { updateDetails, resetDetails, selectedDetail } = useModalDetails(modalOptions);

    const onRowClick = useCallback(
        (value: (typeof BASIC_PAYOUTS_LIST)[0]) => {
            updateDetails({
                selection: { type: 'payout', data: { ...value, balanceAccountDescription } },
                modalSize: 'small',
            }).callback({ id: value.id });
        },
        [updateDetails, balanceAccountDescription]
    );

    const isModalOpen = !!selectedDetail;

    useEffect(() => {
        if (isModalOpen) {
            popoverUtil.closeAll();
        }
    }, [isModalOpen]);

    return (
        <div className={BASE_CLASS}>
            <PayoutsTable
                error={error}
                loading={loading}
                onContactSupport={onContactSupport}
                onRowClick={onRowClick}
                onDataSelection={onDataSelection}
                showPagination={showPagination}
                data={data}
                {...paginationProps}
            />
            <Modal
                title={selectedDetail?.title ? i18n.get(selectedDetail.title) : undefined}
                isOpen={!!selectedDetail}
                aria-label={i18n.get('payoutDetails')}
                onClose={resetDetails}
                isDismissible={true}
                headerWithBorder={false}
                size={selectedDetail?.modalSize ?? 'large'}
            >
                {selectedDetail && (
                    <Suspense
                        fallback={
                            <span className={SPINNER_CONTAINER_CLASS}>
                                <Spinner size={'medium'} />
                            </span>
                        }
                    >
                        <ModalContent data={selectedDetail.selection.data} />
                    </Suspense>
                )}
            </Modal>
        </div>
    );
};
