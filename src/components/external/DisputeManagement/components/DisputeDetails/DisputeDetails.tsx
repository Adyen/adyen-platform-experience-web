import useCoreContext from '../../../../../core/Context/useCoreContext';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import type { ExternalUIComponentProps } from '../../../../types';
import { useDisputeFlow } from '../../context/dispute/context';
import { DisputeManagementProps } from '../../types';
import { AcceptDisputeFlow } from '../AcceptDisputeFlow/AcceptDisputeFlow';
import { DefendDisputeFlow } from '../DefendDisputeFlow/DefendDisputeFlow';
import DisputeData from '../DisputesData/DisputeData';

export const DisputeDetails = ({
    id,
    hideTitle,
    dataCustomization,
    onContactSupport,
    onDisputeAccept,
    onDisputeDefend,
    onDismiss,
}: ExternalUIComponentProps<DisputeManagementProps>) => {
    const { flowState } = useDisputeFlow();
    const { i18n } = useCoreContext();

    switch (flowState) {
        case 'details':
            return (
                <>
                    {!hideTitle && (
                        <Typography variant={TypographyVariant.TITLE} medium>
                            {i18n.get('disputes.disputeManagementTitle')}
                        </Typography>
                    )}
                    <DisputeData disputeId={id} dataCustomization={dataCustomization} onContactSupport={onContactSupport} onDismiss={onDismiss} />
                </>
            );
        case 'accept':
            return <AcceptDisputeFlow onDisputeAccept={onDisputeAccept} />;
        case 'defendReasonSelectionView':
        case 'defenseSubmitResponseView':
        case 'uploadDefenseFilesView':
            return <DefendDisputeFlow onDisputeDefend={onDisputeDefend} />;
        default:
            return null;
    }
};
