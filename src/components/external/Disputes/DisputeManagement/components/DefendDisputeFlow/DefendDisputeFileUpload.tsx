import { useCallback, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../../core/ConfigContext';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import useMutation from '../../../../../../hooks/useMutation/useMutation';
import { TranslationKey } from '../../../../../../translations';
import ButtonActions from '../../../../../internal/Button/ButtonActions/ButtonActions';
import Card from '../../../../../internal/Card/Card';
import { TypographyVariant } from '../../../../../internal/Typography/types';
import Typography from '../../../../../internal/Typography/Typography';
import { useDisputeFlow } from '../../context/dispute/context';
import { DefendDocumentUpload } from './DefendDocumentUpload';
import { SelectItem } from '../../../../../internal/FormFields/Select/types';
import SelectAndUploadOptionalDoc from './SelectAndUploadOptionalDoc';
import Button from '../../../../../internal/Button';
import Icon from '../../../../../internal/Icon';
import { ButtonActionsList } from '../../../../../internal/Button/ButtonActions/types';
import { ButtonVariant } from '../../../../../internal/Button/types';
import { getDefenseDocumentContent } from '../../utils';
import { validationErrors } from '../../../../../internal/FormFields/FileInput/constants';
import { getHumanReadableFileSize } from '../../../../../../utils';
import { MapErrorCallback } from './types';
import './DefendDisputeFlow.scss';

const documentRequirements: TranslationKey[] = [
    'disputes.management.defend.common.documentRequirements.language',
    'disputes.management.defend.common.documentRequirements.recommendedSize',
    'disputes.management.defend.common.documentRequirements.formatAndSize',
];

export const DefendDisputeFileUpload = () => {
    const { i18n } = useCoreContext();
    const { defendDispute } = useConfigContext().endpoints;
    const {
        clearFiles,
        clearStates,
        dispute,
        applicableDocuments,
        goBack,
        defendDisputePayload,
        defendResponse,
        onDefendSubmit,
        removeFieldFromDefendPayload,
        setFlowState,
        defenseDocumentConfig,
    } = useDisputeFlow();

    const disputePspReference = dispute?.dispute.pspReference;

    const [oneOrMoreSelectedDocument, setOneOrMoreSelectedDocument] = useState<string | undefined>(undefined);
    const [optionalSelectedDocuments, setOptionalSelectedDocuments] = useState<(string | undefined)[]>([]);

    const goBackToDetails = useCallback(() => {
        clearStates();
        setFlowState('details');
    }, [clearStates, setFlowState]);

    const mapError: MapErrorCallback = useCallback(
        (error, file) => {
            switch (error) {
                case validationErrors.DISALLOWED_FILE_TYPE:
                    return i18n.get('common.inputs.file.errors.disallowedType');
                case validationErrors.FILE_REQUIRED:
                    return i18n.get('disputes.management.defend.common.inputs.file.errors.required');
                case validationErrors.TOO_MANY_FILES:
                    return i18n.get('common.inputs.file.errors.tooMany');
                case validationErrors.VERY_LARGE_FILE:
                    return i18n.get('disputes.management.defend.common.inputs.file.errors.tooLarge', {
                        values: {
                            size: file?.size === undefined ? undefined : getHumanReadableFileSize(file.size),
                            type: file?.type?.replace(/^([^/]+\/)*/gi, '')?.toUpperCase(),
                        },
                    });
                default:
                    return i18n.get('disputes.management.defend.common.inputs.file.errors.default');
            }
        },
        [i18n]
    );

    const { requiredDocuments, optionalDocuments, oneOrMoreDocuments } = useMemo(() => {
        const docs: { requiredDocuments: string[]; optionalDocuments: SelectItem<string>[]; oneOrMoreDocuments: SelectItem<string>[] } = {
            requiredDocuments: [],
            optionalDocuments: [],
            oneOrMoreDocuments: [],
        };

        (applicableDocuments ?? []).forEach(({ documentTypeCode, requirementLevel }) => {
            const name = getDefenseDocumentContent(defenseDocumentConfig, i18n, documentTypeCode)?.title || documentTypeCode;
            switch (requirementLevel) {
                case 'REQUIRED':
                    docs.requiredDocuments.push(documentTypeCode);
                    break;
                case 'OPTIONAL':
                    docs.optionalDocuments.push({
                        id: documentTypeCode,
                        name,
                    });
                    break;
                case 'ONE_OR_MORE':
                    docs.oneOrMoreDocuments.push({
                        id: documentTypeCode,
                        name,
                    });
                    break;
            }
            return docs;
        });

        return docs;
    }, [applicableDocuments, i18n]);

    const requiredDocumentsUploaded = useMemo(() => {
        if (!defendDisputePayload) return false;

        let requiredDocumentsPresent = requiredDocuments.every(d => defendDisputePayload.get(d) instanceof File);

        if (oneOrMoreDocuments.length > 0) {
            requiredDocumentsPresent &&= oneOrMoreDocuments.some(d => defendDisputePayload.get(d.id) instanceof File);
        }
        return requiredDocumentsPresent;
    }, [defendDisputePayload, oneOrMoreDocuments, requiredDocuments]);

    const defendDisputeMutation = useMutation({
        queryFn: defendDispute,
        options: {
            onSuccess: useCallback(() => {
                clearFiles();
                onDefendSubmit('success');
                setFlowState('defenseSubmitResponseView');
            }, [clearFiles, onDefendSubmit, setFlowState]),
            onError: useCallback(() => {
                clearFiles();
                onDefendSubmit('error');
                setFlowState('defenseSubmitResponseView');
            }, [clearFiles, onDefendSubmit, setFlowState]),
        },
    });

    const disputeDefended = defendResponse === 'success';
    const interactionsDisabled = defendDisputeMutation.isLoading || disputeDefended;
    const canSubmitDocuments = defendDisputePayload && requiredDocumentsUploaded && !interactionsDisabled;

    const defendDisputeCallback = useCallback(() => {
        if (canSubmitDocuments) {
            void defendDisputeMutation.mutate(
                { contentType: 'multipart/form-data', body: defendDisputePayload },
                { path: { disputePspReference: disputePspReference! } }
            );
        }
    }, [canSubmitDocuments, disputePspReference, defendDisputeMutation, defendDisputePayload]);

    const actionButtons = useMemo<ButtonActionsList>(() => {
        return [
            {
                title: i18n.get('disputes.management.defend.common.actions.submit'),
                disabled: !canSubmitDocuments,
                state: defendDisputeMutation.isLoading ? 'loading' : 'default',
                variant: ButtonVariant.PRIMARY,
                event: defendDisputeCallback,
                classNames: disputeDefended ? ['adyen-pe-defend-dispute__defended-btn'] : undefined,
                renderTitle: title => {
                    if (disputeDefended) {
                        return (
                            <>
                                <Icon name="checkmark-circle-fill" className="adyen-pe-defend-dispute__defended-icon" />
                                {i18n.get('disputes.management.defend.common.defended')}
                            </>
                        );
                    }
                    return title;
                },
            },
            {
                title: i18n.get('disputes.management.common.actions.goBack'),
                disabled: defendDisputeMutation.isLoading,
                variant: ButtonVariant.SECONDARY,
                event: disputeDefended ? goBackToDetails : goBack,
            },
        ];
    }, [i18n, canSubmitDocuments, defendDisputeMutation.isLoading, defendDisputeCallback, disputeDefended, goBackToDetails, goBack]);

    const addOptionalDocument = useCallback((documentType?: string, index?: number) => {
        if (documentType === undefined) {
            setOptionalSelectedDocuments(prev => [...prev, documentType]);
        } else if (index !== undefined) {
            setOptionalSelectedDocuments(prev => {
                if (prev[index] === documentType) {
                    return prev;
                }
                const newDocs = [...prev];
                newDocs[index] = documentType;
                return newDocs;
            });
        }
    }, []);

    const canAddOptionalDocument = useMemo(() => {
        if (interactionsDisabled) return false;
        const optionalDocumentsCount = optionalDocuments.length + Math.max(0, oneOrMoreDocuments.length - 1);
        return Boolean(optionalDocumentsCount && optionalDocumentsCount !== optionalSelectedDocuments.length);
    }, [interactionsDisabled, oneOrMoreDocuments, optionalDocuments, optionalSelectedDocuments]);

    const addEmptyOptionalDocument = useCallback(() => {
        if (canAddOptionalDocument) addOptionalDocument();
    }, [canAddOptionalDocument, addOptionalDocument]);

    const availableOptionalDocuments = useMemo(() => {
        const additionalOptionalDocs = oneOrMoreDocuments.filter(doc => doc.id !== oneOrMoreSelectedDocument);

        return [...additionalOptionalDocs, ...optionalDocuments].map(doc => {
            return { ...doc, disabled: optionalSelectedDocuments.includes(doc.id) };
        });
    }, [oneOrMoreDocuments, oneOrMoreSelectedDocument, optionalDocuments, optionalSelectedDocuments]);

    const removeSelectedOptionalDocument = useCallback(
        (indexToRemove: number) => {
            setOptionalSelectedDocuments(prevDocs => {
                if (indexToRemove < 0 || indexToRemove >= prevDocs.length) {
                    return prevDocs;
                }
                const docToRemove = prevDocs[indexToRemove];

                // If removeFileFromDefendPayload exists and a document type was actually selected for this slot
                if (docToRemove) {
                    removeFieldFromDefendPayload(docToRemove);
                }
                return prevDocs.filter((_, index) => index !== indexToRemove);
            });
        },
        [removeFieldFromDefendPayload]
    );

    return (
        <>
            <>
                <Typography className="adyen-pe-defend-dispute-file-uploader__subtitle" variant={TypographyVariant.BODY}>
                    {i18n.get('disputes.management.defend.common.documentUploadInfo')}
                </Typography>
                <Card
                    renderHeader={
                        <Typography variant={TypographyVariant.BODY} stronger className={'adyen-pe-defend-dispute-document-requirements'}>
                            {i18n.get('disputes.management.defend.common.documentRequirements')}
                        </Typography>
                    }
                    filled
                    expandable
                    compact
                >
                    <ul className={'adyen-pe-defend-dispute-document-requirements--list'}>
                        {documentRequirements.map((item, index) => (
                            <li className={'adyen-pe-defend-dispute-document-requirements--item'} key={`${item}-${index}`}>
                                <Typography variant={TypographyVariant.BODY}>{i18n.get(item)}</Typography>
                            </li>
                        ))}
                    </ul>
                </Card>
                <div className={'adyen-pe-defend-dispute-file-uploader__container'}>
                    {requiredDocuments.length || oneOrMoreDocuments.length ? (
                        <div className="adyen-pe-defend-dispute-document-upload-box">
                            {requiredDocuments.length ? (
                                <div className="adyen-pe-defend-dispute-document-upload-box__required-documents">
                                    {requiredDocuments?.map(document => {
                                        return (
                                            <DefendDocumentUpload
                                                mapError={mapError}
                                                disabled={interactionsDisabled}
                                                key={document}
                                                document={document}
                                                required
                                            />
                                        );
                                    })}
                                </div>
                            ) : null}

                            {oneOrMoreDocuments.length ? (
                                <SelectAndUploadOptionalDoc
                                    mapError={mapError}
                                    disabled={interactionsDisabled}
                                    selection={oneOrMoreSelectedDocument}
                                    setSelection={(val: string) => setOneOrMoreSelectedDocument(val)}
                                    items={oneOrMoreDocuments}
                                    title={i18n.get('disputes.management.defend.common.documentTypes.required')}
                                    required
                                />
                            ) : null}
                        </div>
                    ) : null}
                    {optionalSelectedDocuments.length
                        ? optionalSelectedDocuments.map((doc, index) => {
                              return (
                                  <div key={`optional-doc-${index}`} className="adyen-pe-defend-dispute-document-upload-box">
                                      <SelectAndUploadOptionalDoc
                                          mapError={mapError}
                                          disabled={interactionsDisabled}
                                          onRemoveOption={removeSelectedOptionalDocument}
                                          selection={doc}
                                          setSelection={addOptionalDocument}
                                          index={index}
                                          items={availableOptionalDocuments}
                                          title={i18n.get('disputes.management.defend.common.documentTypes.optional')}
                                          required
                                      />
                                  </div>
                              );
                          })
                        : null}
                    {canAddOptionalDocument && (
                        <Button align="center" onClick={addEmptyOptionalDocument} variant={ButtonVariant.SECONDARY} fullWidth>
                            <Icon name="plus" />
                            {i18n.get('disputes.management.defend.common.actions.addOptionalDocument')}
                        </Button>
                    )}
                </div>
                <div className={'adyen-pe-defend-file-uploader__actions'}>
                    <ButtonActions actions={actionButtons} />
                </div>
            </>
        </>
    );
};
