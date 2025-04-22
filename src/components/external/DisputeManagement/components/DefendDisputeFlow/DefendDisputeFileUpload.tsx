import { useCallback, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { TranslationKey } from '../../../../../translations';
import { IApplicableDefenseDocument } from '../../../../../types/api/models/disputes';
import Button from '../../../../internal/Button/Button';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import { ButtonVariant } from '../../../../internal/Button/types';
import FileInput from '../../../../internal/FormFields/FileInput/FileInput';
import Icon from '../../../../internal/Icon';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import './DefendDisputeFlow.scss';
import { useDisputeFlow } from '../../context/dispute/context';

export const DefendDisputeFileUpload = () => {
    const { i18n } = useCoreContext();
    const { dispute, applicableDocuments, goBack, clearStates, uploadedFiles, setFlowState } = useDisputeFlow();
    const disputeId = dispute?.id;
    const [defenseFilesSubmitted, setDefenseFilesSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState(false);
    const { defendDispute } = useConfigContext().endpoints;

    const defendDisputeMutation = useMutation({
        queryFn: defendDispute,
        options: {
            onSuccess: useCallback(() => {
                clearStates();
                setDefenseFilesSubmitted(true);
            }, [clearStates]),
            onError: useCallback(() => {
                setSubmitError(true);
            }, []),
        },
    });

    const defendDisputeCallback = useCallback(() => {
        //TODO: add error case
        if (!uploadedFiles) return;
        const form = new FormData();
        void defendDisputeMutation.mutate({ contentType: 'multipart/form-data', body: form }, { path: { disputePspReference: disputeId! } });
    }, [disputeId, defendDisputeMutation, uploadedFiles]);

    const goBackToDetails = useCallback(() => setFlowState('details'), [setFlowState]);
    const goBackToFileUploadView = useCallback(() => {
        setFlowState('uploadDefenseFilesView');
        setSubmitError(false);
    }, [setFlowState]);

    const actionButtons = useMemo(() => {
        return [
            {
                title: i18n.get('dispute.submit'),
                disabled: false,
                event: defendDisputeCallback,
            },
            {
                title: i18n.get('disputes.goBack'),
                disabled: false,
                event: goBack,
            },
        ];
    }, [goBack, defendDisputeCallback, i18n]);

    //TODO: For this view create an internal component
    if (submitError) {
        return (
            <div className="adyen-pe-defend-dispute__error">
                <Icon name="cross-circle-fill" className="adyen-pe-defend-dispute__error-icon" />
                <Typography variant={TypographyVariant.TITLE}>{i18n.get('refundActionErrorTitle')}</Typography>
                <Button variant={ButtonVariant.SECONDARY} onClick={goBackToFileUploadView}>
                    {i18n.get('disputes.goBack')}
                </Button>
            </div>
        );
    }

    return (
        <>
            {defenseFilesSubmitted ? (
                <>
                    <div className="adyen-pe-defend-dispute__success">
                        <Icon name="checkmark-circle-fill" className="adyen-pe-defend-dispute__success-icon" />
                        <Typography variant={TypographyVariant.TITLE}>{i18n.get('dispute.evidenceSubmitted')}</Typography>
                        <Button variant={ButtonVariant.SECONDARY} onClick={goBackToDetails}>
                            {i18n.get('dispute.defendSubmittedSuccessfully')}
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <Typography className="adyen-pe-defend-dispute-file-uploader__description" variant={TypographyVariant.BODY}>
                        {i18n.get('dispute.uploadDocumentChargebackFeeInformation')}
                    </Typography>
                    <div className={'adyen-pe-defend-dispute-file-uploader__container'}>
                        {applicableDocuments?.map((document: IApplicableDefenseDocument) => (
                            <FileInput key={document} onChange={() => {}}>
                                {i18n.get(document.type as TranslationKey)}
                            </FileInput>
                        ))}
                    </div>
                    <div className={'adyen-pe-defend-file-uploader__actions'}>
                        <ButtonActions actions={actionButtons} />
                    </div>
                </>
            )}
        </>
    );
};
