import useCoreContext from '../../../../core/Context/useCoreContext';
import { useCallback, useEffect } from 'preact/hooks';
import { popoverUtil } from '../../../internal/Popover/utils/popoverUtil';
import Modal from '../../../internal/Modal';
import { PayByLinkOverviewModalType } from './types';

export interface PayByLinkOverviewModalProps {
    isModalVisible: boolean;
    onCloseModal: () => void;
    onContactSupport?: () => void;
    modalType?: PayByLinkOverviewModalType;
}

export const PayByLinkOverviewModal = ({ isModalVisible, onCloseModal, modalType }: PayByLinkOverviewModalProps) => {
    const { i18n } = useCoreContext();

    const onCloseCallback = useCallback(() => {
        onCloseModal();
    }, [onCloseModal]);

    useEffect(() => {
        if (isModalVisible) {
            popoverUtil.closeAll();
        }
    }, [isModalVisible]);

    return (
        <div>
            {isModalVisible && modalType && (
                <Modal
                    isOpen={isModalVisible}
                    aria-label={i18n.get('payByLink.overview.title')}
                    onClose={onCloseCallback}
                    isDismissible={true}
                    headerWithBorder={false}
                    size={'large'}
                >
                    {modalType === 'LinkCreation' ? <div>{'PayByLinkCreation'}</div> : null}
                    {modalType === 'Settings' ? <div>{'Settings'}</div> : null}
                </Modal>
            )}
        </div>
    );
};
