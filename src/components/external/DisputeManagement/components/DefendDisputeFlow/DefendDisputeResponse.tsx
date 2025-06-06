import { useCallback } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import Icon from '../../../../internal/Icon';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { useDisputeFlow } from '../../context/dispute/context';
import './DefendDisputeFlow.scss';

export const DefendDisputeResponse = () => {
    const { i18n } = useCoreContext();
    const { clearFiles, clearStates, setFlowState, defendResponse } = useDisputeFlow();

    const goBackToDetails = useCallback(() => {
        clearStates();
        setFlowState('details');
    }, [clearStates, setFlowState]);

    const goBackToFileUploadView = useCallback(() => {
        clearFiles();
        setFlowState('uploadDefenseFilesView');
    }, [clearFiles, setFlowState]);

    //TODO: For this view create an internal component
    return (
        <div className={'adyen-pe-defend-dispute__response'}>
            {defendResponse === 'success' ? (
                <div className="adyen-pe-defend-dispute__success">
                    <Icon name="checkmark-circle-fill" className="adyen-pe-defend-dispute__success-icon" />
                    <Typography variant={TypographyVariant.TITLE}>{i18n.get('disputes.defend.evidenceSubmitted')}</Typography>
                    <Typography variant={TypographyVariant.BODY} className="adyen-pe-defend-dispute__success-description">
                        {i18n.get('disputes.defend.submitSuccessfulInformation')}
                    </Typography>
                    <div className="adyen-pe-defend-dispute__success-buttons">
                        <Button variant={ButtonVariant.SECONDARY} onClick={goBackToDetails}>
                            {i18n.get('disputes.showDisputeDetails')}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="adyen-pe-defend-dispute__error">
                    <Icon name="cross-circle-fill" className="adyen-pe-defend-dispute__error-icon" />
                    <Typography variant={TypographyVariant.TITLE} medium>
                        {i18n.get('disputes.defend.somethingWentWrong')}
                    </Typography>
                    <Typography variant={TypographyVariant.BODY}>
                        {i18n.get('disputes.error.weCouldNotProcessTheDisputePleaseTryAgainOrContactSupport')}
                    </Typography>
                    <Button variant={ButtonVariant.SECONDARY} onClick={goBackToFileUploadView}>
                        {i18n.get('disputes.goBack')}
                    </Button>
                </div>
            )}
        </div>
    );
};
