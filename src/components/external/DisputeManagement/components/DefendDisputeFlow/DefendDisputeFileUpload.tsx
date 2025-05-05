import { useRef } from 'preact/compat';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { TranslationKey } from '../../../../../translations';
import { IDisputeDefenseDocument } from '../../../../../types/api/models/disputes';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import ExpandableCard from '../../../../internal/ExpandableCard/ExpandableCard';
import FileInput from '../../../../internal/FormFields/FileInput/FileInput';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import './DefendDisputeFlow.scss';
import { useDisputeFlow } from '../../context/dispute/context';

const documentRequirements: TranslationKey[] = [
    'dispute.defendDocumentMustBeInEnglish',
    'dispute.defendDocumentRecommendedSize',
    'dispute.defendDocumentAcceptableFormats',
];

export const DefendDisputeFileUpload = () => {
    const { i18n } = useCoreContext();
    const { clearFiles, dispute, applicableDocuments, goBack, addFileToDefendPayload, defendDisputePayload, onDefendSubmit } = useDisputeFlow();
    const disputePspReference = dispute?.dispute.pspReference;
    const { defendDispute } = useConfigContext().endpoints;
    const ref = useRef<HTMLInputElement | null>(null);
    const [isFetching, setIsFetching] = useState(false);

    const defendDisputeMutation = useMutation({
        queryFn: defendDispute,
        options: {
            onSuccess: useCallback(() => {
                setIsFetching(false);
                clearFiles();
                onDefendSubmit('success');
            }, [setIsFetching, clearFiles, onDefendSubmit]),
            onError: useCallback(() => {
                setIsFetching(false);
                onDefendSubmit('error');
            }, [setIsFetching, onDefendSubmit]),
        },
    });

    const defendDisputeCallback = useCallback(() => {
        //TODO: add error case
        setIsFetching(true);
        void defendDisputeMutation.mutate(
            { contentType: 'multipart/form-data', body: defendDisputePayload },
            { path: { disputePspReference: disputePspReference! } }
        );
    }, [disputePspReference, defendDisputeMutation, defendDisputePayload]);

    const actionButtons = useMemo(() => {
        return [
            {
                title: i18n.get('dispute.submit'),
                disabled: isFetching,
                event: defendDisputeCallback,
            },
            {
                title: i18n.get('disputes.goBack'),
                disabled: isFetching,
                event: goBack,
            },
        ];
    }, [goBack, defendDisputeCallback, i18n, isFetching]);

    return (
        <>
            <>
                <Typography className="adyen-pe-defend-dispute-file-uploader__description" variant={TypographyVariant.BODY}>
                    {i18n.get('dispute.uploadDefenseDocumentsInformation')}
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
                            <li className={'adyen-pe-defend-dispute-document-requirements--item'} key={`${item}-${index}`}>
                                <Typography variant={TypographyVariant.BODY}>{i18n.get(item)}</Typography>
                            </li>
                        ))}
                    </ul>
                </ExpandableCard>
                <div className={'adyen-pe-defend-dispute-file-uploader__container'}>
                    {applicableDocuments?.map((document: IDisputeDefenseDocument) => (
                        <FileInput
                            ref={ref}
                            key={document}
                            required={document.requirementLevel === 'REQUIRED'}
                            onChange={file => {
                                if (file[0]) addFileToDefendPayload(document.documentTypeCode, file[0]);
                            }}
                        >
                            {i18n.get(document.documentTypeCode as TranslationKey)}
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
