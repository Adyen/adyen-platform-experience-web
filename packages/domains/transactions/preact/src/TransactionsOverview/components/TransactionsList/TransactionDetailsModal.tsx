import { useEffect } from 'preact/hooks';
import { classes } from '../../constants';
import { FC, PropsWithChildren } from 'preact/compat';
import { TransactionDetailsProps } from '../../../TransactionDetails';
import { popoverUtil } from '@integration-components/ui-components-preact/Popover/utils/popoverUtil';
import { useCoreContext } from '@integration-components/core/preact';
import useModalDetails from '@integration-components/hooks-preact/useModalDetails';
import TransactionData from '../../../TransactionDetails/components/TransactionData';
import Modal from '@integration-components/ui-components-preact/Modal';

export interface DataOverviewDisplayProps {
    onContactSupport?: () => void;
    dataCustomization?: TransactionDetailsProps['dataCustomization'];
    resetDetails: ReturnType<typeof useModalDetails>['resetDetails'];
    selectedDetail: ReturnType<typeof useModalDetails>['selectedDetail'];
}

export const TransactionDetailsModal: FC<DataOverviewDisplayProps> = ({
    children,
    dataCustomization,
    onContactSupport,
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
        <div className={classes.details}>
            {children}
            {selectedDetail && (
                <Modal
                    isOpen={isModalOpen}
                    aria-label={i18n.get('transactions.details.title')}
                    onClose={resetDetails}
                    isDismissible={true}
                    headerWithBorder={false}
                    size={selectedDetail.modalSize || 'large'}
                >
                    <TransactionData
                        id={selectedDetail.selection.data}
                        dataCustomization={dataCustomization}
                        onContactSupport={onContactSupport}
                        hideTitle
                    />
                </Modal>
            )}
        </div>
    );
};
