import Modal from '@src/components/internal/Modal';
import { popoverUtil } from '@src/components/internal/Popover/utils/popoverUtil';
import Spinner from '@src/components/internal/Spinner';
import useCoreContext from '@src/core/Context/useCoreContext';
import useModalDetails from '@src/hooks/useModalDetails/useModalDetails';
import { FC, PropsWithChildren, Suspense } from 'preact/compat';
import { useEffect } from 'preact/hooks';
import { JSXInternal } from 'preact/src/jsx';

export interface DataOverviewDisplayProps {
    onContactSupport?: () => void;
    balanceAccountDescription?: string;
    selectedDetail: ReturnType<typeof useModalDetails>['selectedDetail'] | null;
    renderModalContent: () => JSXInternal.Element;
    resetDetails: ReturnType<typeof useModalDetails>['resetDetails'];
    className: string;
}
export const DataOverviewDisplay: FC<DataOverviewDisplayProps> = ({
    children,
    className,
    selectedDetail,
    resetDetails,
    renderModalContent,
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
                            {renderModalContent()}
                        </Suspense>
                    )}
                </Modal>
            )}
        </div>
    );
};
