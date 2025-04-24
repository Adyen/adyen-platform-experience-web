import { useCallback } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import Icon from '../../../../internal/Icon';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import './DefendDisputeFlow.scss';
import { useDisputeFlow } from '../../context/dispute/context';

export const DefendDisputeResponse = () => {
    const { i18n } = useCoreContext();
    const { clearStates, setFlowState, defendResponse } = useDisputeFlow();

    const goBackToDetails = useCallback(() => {
        clearStates();
        setFlowState('details');
    }, [setFlowState]);

    const goBackToFileUploadView = useCallback(() => {
        setFlowState('uploadDefenseFilesView');
    }, [setFlowState]);

    //TODO: For this view create an internal component
    return (
        <div className={'adyen-pe-defend-dispute__response'}>
            {defendResponse === 'success' ? (
                <div className="adyen-pe-defend-dispute__success">
                    <Icon name="checkmark-circle-fill" className="adyen-pe-defend-dispute__success-icon" />
                    <Typography variant={TypographyVariant.TITLE}>{i18n.get('dispute.evidenceSubmitted')}</Typography>
                    <Typography variant={TypographyVariant.BODY}>{i18n.get('dispute.defendSubmittedSuccessfully')}</Typography>
                    <Button variant={ButtonVariant.SECONDARY} onClick={goBackToDetails}>
                        {i18n.get('dispute.showDetails')}
                    </Button>
                </div>
            ) : (
                <div className="adyen-pe-defend-dispute__error">
                    <Icon name="cross-circle-fill" className="adyen-pe-defend-dispute__error-icon" />
                    <Typography variant={TypographyVariant.TITLE}>{i18n.get('refundActionErrorTitle')}</Typography>
                    <Button variant={ButtonVariant.SECONDARY} onClick={goBackToFileUploadView}>
                        {i18n.get('disputes.goBack')}
                    </Button>
                </div>
            )}
        </div>
    );
};
