import cx from 'classnames';
import { PropsWithChildren } from 'preact/compat';
import type { ExternalUIComponentProps } from '../../../../types';
import { useModalContext } from '../../../../internal/Modal/Modal';
import { useDisputeFlow } from '../../context/dispute/context';
import { Header } from '../../../../internal/Header';
import { DisputeManagementProps } from '../../types';
import { AcceptDisputeFlow } from '../AcceptDisputeFlow/AcceptDisputeFlow';
import { DefendDisputeFlow } from '../DefendDisputeFlow/DefendDisputeFlow';
import DisputeData from '../DisputesData/DisputeData';
import { useEffect } from 'preact/hooks';

const DisputeDetailsContainer = ({ children, hideTitle }: PropsWithChildren<Pick<ExternalUIComponentProps<DisputeManagementProps>, 'hideTitle'>>) => {
    const { flowState } = useDisputeFlow();
    const { withinModal } = useModalContext();
    return (
        <>
            <div className={cx({ ['adyen-pe-visually-hidden']: flowState !== 'details' })}>
                <Header hideTitle={hideTitle} forwardedToRoot={!withinModal} titleKey="disputes.management.common.title" />
            </div>
            {children}
        </>
    );
};

export const DisputeDetails = ({
    id,
    hideTitle,
    dataCustomization,
    onContactSupport,
    onDisputeAccept,
    onDisputeDefend,
    onDismiss,
}: ExternalUIComponentProps<DisputeManagementProps>) => {
    const { flowState, getDisputesConfig } = useDisputeFlow();

    useEffect(() => {
        void getDisputesConfig();
    }, [getDisputesConfig]);

    switch (flowState) {
        case 'details':
            return (
                <DisputeDetailsContainer hideTitle={hideTitle}>
                    <DisputeData disputeId={id} dataCustomization={dataCustomization} onContactSupport={onContactSupport} onDismiss={onDismiss} />
                </DisputeDetailsContainer>
            );
        case 'accept':
            return (
                <DisputeDetailsContainer hideTitle={hideTitle}>
                    <AcceptDisputeFlow onDisputeAccept={onDisputeAccept} />
                </DisputeDetailsContainer>
            );
        case 'defendReasonSelectionView':
        case 'defenseSubmitResponseView':
        case 'uploadDefenseFilesView':
            return (
                <DisputeDetailsContainer hideTitle={hideTitle}>
                    <DefendDisputeFlow onDisputeDefend={onDisputeDefend} />
                </DisputeDetailsContainer>
            );
        default:
            return null;
    }
};
