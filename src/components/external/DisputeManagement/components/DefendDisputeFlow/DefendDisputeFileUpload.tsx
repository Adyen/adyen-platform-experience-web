import { useRef } from 'preact/compat';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { useConfigContext } from '../../../../../core/ConfigContext';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useMutation from '../../../../../hooks/useMutation/useMutation';
import { TranslationKey } from '../../../../../translations';
import ButtonActions from '../../../../internal/Button/ButtonActions/ButtonActions';
import Card from '../../../../internal/Card/Card';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { useDisputeFlow } from '../../context/dispute/context';
import { DefendDocumentUpload } from './DefendDocumentUpload';
import { SelectItem } from '../../../../internal/FormFields/Select/types';
import SelectAndUploadOptionalDoc from './SelectAndUploadOptionalDoc';
import Button from '../../../../internal/Button';
import Icon from '../../../../internal/Icon';
import { ButtonVariant } from '../../../../internal/Button/types';
import { getDefenseDocumentContent } from '../../utils';
import { DISPUTE_INTERNAL_SYMBOL } from '../../../../utils/disputes/constants';
import { validationErrors } from '../../../../internal/FormFields/FileInput/constants';
import { getHumanReadableFileSize, isFunction } from '../../../../../utils';
import { DisputeManagementProps } from '../../types';
import { MapErrorCallback } from './types';
import './DefendDisputeFlow.scss';

const documentRequirements: TranslationKey[] = [
    'disputes.documentRequirements.mustBeInEnglish',
    'disputes.documentRequirements.recommendedSize',
    'disputes.documentRequirements.acceptableFormatAndSize',
];

export const DefendDisputeFileUpload = ({ onDisputeDefend }: Pick<DisputeManagementProps, 'onDisputeDefend'>) => {
    const { i18n } = useCoreContext();
    const { clearFiles, dispute, applicableDocuments, goBack, defendDisputePayload, onDefendSubmit, removeFieldFromDefendPayload } = useDisputeFlow();
    const disputePspReference = dispute?.dispute.pspReference;
    const { defendDispute } = useConfigContext().endpoints;
    const ref = useRef<HTMLInputElement | null>(null);
    const [isFetching, setIsFetching] = useState(false);

    const mapError: MapErrorCallback = useCallback(
        (error, file) => {
            switch (error) {
                case validationErrors.DISALLOWED_FILE_TYPE:
                    return i18n.get('inputError.disallowedFileType');
                case validationErrors.FILE_REQUIRED:
                    return i18n.get('disputes.inputError.uploadAtLeastOneSupportingDocumentToContinue');
                case validationErrors.TOO_MANY_FILES:
                    return i18n.get('inputError.tooManyFiles');
                case validationErrors.VERY_LARGE_FILE:
                    return i18n.get('disputes.inputError.fileIsOverSizeLimitForTypeChooseASmallerFileAndTryAgain', {
                        values: {
                            size: file && file.size ? getHumanReadableFileSize(file.size) : undefined,
                            type: file?.type?.replace('application/', '').replace('image/', ''),
                        },
                    });
                default:
                    return i18n.get('disputes.inputError.somethingWentWrongPleaseCheckYourDocuments');
            }
        },
        [i18n]
    );

    const defendDisputeMutation = useMutation({
        queryFn: defendDispute,
        options: {
            onSuccess: useCallback(() => {
                setIsFetching(false);
                clearFiles();

                if (isFunction(onDisputeDefend)) {
                    const returnValue: unknown = onDisputeDefend({ id: disputePspReference! });
                    if (returnValue !== DISPUTE_INTERNAL_SYMBOL) return;
                }
                onDefendSubmit('success');
            }, [clearFiles, disputePspReference, onDefendSubmit, onDisputeDefend]),
            onError: useCallback(() => {
                setIsFetching(false);
                clearFiles();
                onDefendSubmit('error');
            }, [onDefendSubmit]),
        },
    });

    const defendDisputeCallback = useCallback(() => {
        //TODO: add error case
        setIsFetching(true);
        if (defendDisputePayload) {
            void defendDisputeMutation.mutate(
                { contentType: 'multipart/form-data', body: defendDisputePayload },
                { path: { disputePspReference: disputePspReference! } }
            );
        }
    }, [disputePspReference, defendDisputeMutation, defendDisputePayload]);

    const [oneOrMoreSelectedDocument, setOneOrMoreSelectedDocument] = useState<string | undefined>(undefined);
    const [optionalSelectedDocuments, setOptionalSelectedDocuments] = useState<(string | undefined)[]>([]);

    const { requiredDocuments, optionalDocuments, oneOrMoreDocuments } = useMemo(() => {
        const docs: { requiredDocuments: string[]; optionalDocuments: SelectItem<string>[]; oneOrMoreDocuments: SelectItem<string>[] } = {
            requiredDocuments: [],
            optionalDocuments: [],
            oneOrMoreDocuments: [],
        };

        (applicableDocuments ?? []).forEach(({ documentTypeCode, requirementLevel }) => {
            const name = getDefenseDocumentContent(i18n, documentTypeCode)?.title || documentTypeCode;
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

    const areRequiredDocsUploaded = useMemo(() => {
        if (!defendDisputePayload) return false;

        const allRequiredDocumentsPresent = requiredDocuments.every(d => defendDisputePayload.get(d) instanceof File);

        if (oneOrMoreDocuments.length === 0) return allRequiredDocumentsPresent;

        const atLeastOneOptionalDocumentPresent = oneOrMoreDocuments.some(d => defendDisputePayload.get(d.id) instanceof File);

        return allRequiredDocumentsPresent && atLeastOneOptionalDocumentPresent;
    }, [defendDisputePayload, oneOrMoreDocuments, requiredDocuments]);

    const actionButtons = useMemo(() => {
        return [
            {
                title: i18n.get('disputes.defend.submit'),
                disabled: isFetching || !areRequiredDocsUploaded,
                event: defendDisputeCallback,
            },
            {
                title: i18n.get('disputes.goBack'),
                disabled: isFetching,
                event: goBack,
            },
        ];
    }, [i18n, isFetching, areRequiredDocsUploaded, defendDisputeCallback, goBack]);

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

    const addEmptyOptionalDocument = useCallback(() => {
        addOptionalDocument();
    }, [addOptionalDocument]);

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

    const canAddOptionalDocument = useMemo(() => {
        const optionalDocumentsCount = optionalDocuments.length + Math.max(0, oneOrMoreDocuments.length - 1);
        return Boolean(optionalDocumentsCount && optionalDocumentsCount !== optionalSelectedDocuments.length);
    }, [oneOrMoreDocuments, optionalDocuments, optionalSelectedDocuments]);

    return (
        <>
            <>
                <Typography className="adyen-pe-defend-dispute-file-uploader__subtitle" variant={TypographyVariant.BODY}>
                    {i18n.get('disputes.defend.uploadDocumentsInformation')}
                </Typography>
                <Card
                    renderHeader={
                        <Typography variant={TypographyVariant.BODY} stronger className={'adyen-pe-defend-dispute-document-requirements'}>
                            {i18n.get('disputes.documentRequirements')}
                        </Typography>
                    }
                    filled
                    expandable
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
                                        return <DefendDocumentUpload mapError={mapError} key={document} document={document} ref={ref} isRequired />;
                                    })}
                                </div>
                            ) : null}

                            {oneOrMoreDocuments.length ? (
                                <SelectAndUploadOptionalDoc
                                    mapError={mapError}
                                    selection={oneOrMoreSelectedDocument}
                                    setSelection={(val: string) => setOneOrMoreSelectedDocument(val)}
                                    items={oneOrMoreDocuments}
                                    ref={ref}
                                    title={i18n.get('disputes.uploadDocuments.extraRequiredDocuments')}
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
                                          onRemoveOption={removeSelectedOptionalDocument}
                                          selection={doc}
                                          setSelection={addOptionalDocument}
                                          index={index}
                                          items={availableOptionalDocuments}
                                          ref={ref}
                                          title={i18n.get('disputes.uploadDocuments.optionalDocument')}
                                          required
                                      />
                                  </div>
                              );
                          })
                        : null}
                    <Button
                        align="center"
                        disabled={!canAddOptionalDocument}
                        onClick={addEmptyOptionalDocument}
                        variant={ButtonVariant.SECONDARY}
                        fullWidth
                    >
                        <Icon name="plus" />
                        {i18n.get('disputes.uploadDocuments.addOptionalDocument')}
                    </Button>
                </div>
                <div className={'adyen-pe-defend-file-uploader__actions'}>
                    <ButtonActions actions={actionButtons} />
                </div>
            </>
        </>
    );
};
