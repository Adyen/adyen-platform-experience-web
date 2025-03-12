import Modal from '../Modal';
import { useEffect } from 'preact/hooks';
import { FC, PropsWithChildren } from 'preact/compat';
import { popoverUtil } from '../Popover/utils/popoverUtil';
import useCoreContext from '../../../core/Context/useCoreContext';
import useModalDetails from '../../../hooks/useModalDetails/useModalDetails';
import ModalContent from '../Modal/ModalContent/ModalContent';
import { DataCustomizationObject } from '../../types';

export interface DataOverviewDisplayProps {
    onContactSupport?: () => void;
    balanceAccountDescription?: string;
    selectedDetail: ReturnType<typeof useModalDetails>['selectedDetail'];
    resetDetails: ReturnType<typeof useModalDetails>['resetDetails'];
    className: string;
    dataCustomization?: DataCustomizationObject<any, any, any>;
}

export const DataDetailsModal: FC<DataOverviewDisplayProps> = ({
    children,
    className,
    selectedDetail,
    resetDetails,
    dataCustomization,
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
                    {selectedDetail && <ModalContent dataCustomization={{ details: dataCustomization }} {...selectedDetail?.selection} />}
                </Modal>
            )}
        </div>
    );
};
