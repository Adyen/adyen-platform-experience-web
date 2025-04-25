import { useRef } from 'preact/compat';
import { useCallback, useMemo } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { TranslationKey } from '../../../../../translations';
import { IApplicableDefenseDocument } from '../../../../../types/api/models/disputes';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import ExpandableCard from '../../../../internal/ExpandableCard/ExpandableCard';
import FileInput from '../../../../internal/FormFields/FileInput/FileInput';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import './DefendDisputeFlow.scss';
import { useDisputeFlow } from '../../context/dispute/context';

//TODO: Add translation
const documentRequirements: TranslationKey[] = [
    'dispute.defendDocumentMustBeInEnglish',
    'dispute.defendDocumentRecommendedSize',
    'dispute.defendDocumentAcceptableFormats',
];

export const DefendDisputeFileUpload = () => {
    const { i18n } = useCoreContext();
    const { clearFiles, dispute, applicableDocuments, goBack, addUploadedFile, uploadedFiles, onDefendSubmit } = useDisputeFlow();
    const disputeId = dispute?.id;
    const { defendDispute } = useConfigContext().endpoints;
    const ref = useRef<HTMLInputElement | null>(null);

    const defendDisputeMutation = useMutation({
        queryFn: defendDispute,
        options: {
            onSuccess: useCallback(() => {
                clearFiles();
                onDefendSubmit('success');
            }, []),
            onError: useCallback(() => {
                clearFiles();
                onDefendSubmit('error');
            }, []),
        },
    });

    const defendDisputeCallback = useCallback(() => {
        //TODO: add error case
        if (!uploadedFiles) return;
        void defendDisputeMutation.mutate({ contentType: 'multipart/form-data', body: uploadedFiles }, { path: { disputePspReference: disputeId! } });
    }, [disputeId, defendDisputeMutation, uploadedFiles]);

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

    return (
        <>
            <>
                <Typography className="adyen-pe-defend-dispute-file-uploader__description" variant={TypographyVariant.BODY}>
                    {i18n.get('dispute.uploadDocumentChargebackFeeInformation')}
                </Typography>
                <ExpandableCard
                    renderHeader={
                        <Typography variant={TypographyVariant.BODY} stronger className={'adyen-pe-defend-dispute-document-requirements'}>
                            {i18n.get('dispute.documentRequirements')}
                        </Typography>
                    }
                    inFlow
                    headerDirection={'row'}
                    filled
                    fullWidth
                >
                    <ul className={'adyen-pe-defend-dispute-document-requirements--list'}>
                        {documentRequirements.map((item, index) => (
                            <li className={'adyen-pe-defend-dispute-document-requirements--item'}>
                                <Typography variant={TypographyVariant.BODY}>{i18n.get(item)}</Typography>
                            </li>
                        ))}
                    </ul>
                </ExpandableCard>
                <div className={'adyen-pe-defend-dispute-file-uploader__container'}>
                    {applicableDocuments?.map((document: IApplicableDefenseDocument) => (
                        <FileInput
                            ref={ref}
                            key={document}
                            required={document.requirement === 'required'}
                            onChange={file => {
                                if (file[0]) addUploadedFile(document.type, file[0]);
                            }}
                        >
                            {i18n.get(document.type as TranslationKey)}
                        </FileInput>
                    ))}
                </div>
                <div className={'adyen-pe-defend-file-uploader__actions'}>
                    <ButtonActions actions={actionButtons} />
                </div>
            </>
        </>
    );
};
