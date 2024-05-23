import Modal from '../Modal';
import { popoverUtil } from '../Popover/utils/popoverUtil';
import Spinner from '../Spinner';
import useCoreContext from '../../../core/Context/useCoreContext';
import useModalDetails from '../../../hooks/useModalDetails/useModalDetails';
import { FC, lazy, PropsWithChildren, Suspense } from 'preact/compat';
import { useEffect } from 'preact/hooks';
const ModalContent = lazy(() => import('../Modal/ModalContent/ModalContent'));

export interface DataOverviewDisplayProps {
    onContactSupport?: () => void;
    balanceAccountDescription?: string;
    selectedDetail: ReturnType<typeof useModalDetails>['selectedDetail'];
    resetDetails: ReturnType<typeof useModalDetails>['resetDetails'];
    className: string;
}
export const DataDetailsModal: FC<DataOverviewDisplayProps> = ({
    children,
    className,
    selectedDetail,
    resetDetails,
}: PropsWithChildren<DataOverviewDisplayProps>) => {
    const { i18n } = useCoreContext();
    const isModalOpen = !!selectedDetail;
    useEffect(() => {
        if (isModalOpen) {
            popoverUtil.closeAll();
        }
    }, [isModalOpen]);
    return (
        <div className={className}>
            {children}
            {selectedDetail && (
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
                                <span className={className + '__spinner-container'}>
                                    <Spinner size={'medium'} />
                                </span>
                            }
                        >
                            <ModalContent {...selectedDetail?.selection} type={selectedDetail.selection.type as 'payout' | 'transaction'} />
                        </Suspense>
                    )}
                </Modal>
            )}
        </div>
    );
};
