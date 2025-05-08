import { useMemo } from 'preact/hooks';
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
    onDefendDispute,
    onAcceptDispute,
    dataCustomization,
}: ExternalUIComponentProps<DisputeManagementProps>) => {
    const { flowState, goBack } = useDisputeFlow();
    const { i18n } = useCoreContext();

    const isDefendFlow = useMemo(
        () => ['defendReasonSelectionView', 'uploadDefenseFilesView', 'defenseSubmitResponseView'].includes(flowState),
        [flowState]
    );

    if (isDefendFlow) {
        return <DefendDisputeFlow onDefendDispute={onDefendDispute} />;
    }

    switch (flowState) {
        case 'details':
            return (
                <>
                    {flowState === 'details' && !hideTitle && (
                        <div>
                            <Typography variant={TypographyVariant.TITLE} medium>
                                {i18n.get('dispute.management')}
                            </Typography>
                        </div>
                    )}
                    <DisputeData disputeId={id} dataCustomization={dataCustomization} />
                </>
            );
        case 'accept':
            return <AcceptDisputeFlow disputeId={id} onBack={goBack} onAcceptDispute={onAcceptDispute} />;
        default:
            return null;
    }
};
