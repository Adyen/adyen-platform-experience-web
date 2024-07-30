import Modal from '../Modal';
import { useEffect } from 'preact/hooks';
import { FC, PropsWithChildren } from 'preact/compat';
import { popoverUtil } from '../Popover/utils/popoverUtil';
import useCoreContext from '../../../core/Context/useCoreContext';
import useModalDetails from '../../../hooks/useModalDetails/useModalDetails';
import ModalContent from '../Modal/ModalContent/ModalContent';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
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
                    title={selectedDetail?.title ? t(selectedDetail.title) : undefined}
                    isOpen={!!selectedDetail}
                    aria-label={t('payoutDetails')}
                    onClose={resetDetails}
                    isDismissible={true}
                    headerWithBorder={false}
                    size={selectedDetail?.modalSize ?? 'large'}
                >
                    {selectedDetail && <ModalContent {...selectedDetail?.selection} />}
                </Modal>
            )}
        </div>
    );
};
