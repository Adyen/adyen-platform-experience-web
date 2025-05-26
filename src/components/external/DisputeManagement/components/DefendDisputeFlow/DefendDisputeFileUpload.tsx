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
import './DefendDisputeFlow.scss';
import { useDisputeFlow } from '../../context/dispute/context';
import { DefendDocumentUpload } from './DefendDocumentUpload';
import { SelectItem } from '../../../../internal/FormFields/Select/types';
import SelectAndUploadOptionalDoc from './SelectAndUploadOptionalDoc';
import Button from '../../../../internal/Button';
import Icon from '../../../../internal/Icon';
import { ButtonVariant } from '../../../../internal/Button/types';
import { getDefenseDocumentContent } from '../../utils';

const documentRequirements: TranslationKey[] = [
    'dispute.defendDocumentMustBeInEnglish',
    'dispute.defendDocumentRecommendedSize',
    'dispute.defendDocumentAcceptableFormatAndSize',
];

export const DefendDisputeFileUpload = () => {
    const { i18n } = useCoreContext();
    const {
        clearFiles,
        dispute,
        applicableDocuments,
        goBack,
        addFileToDefendPayload,
        defendDisputePayload,
        onDefendSubmit,
        removeFieldFromDefendPayload,
    } = useDisputeFlow();
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
        if (defendDisputePayload) {
            void defendDisputeMutation.mutate(
                { contentType: 'multipart/form-data', body: defendDisputePayload },
                { path: { disputePspReference: disputePspReference! } }
            );
        }
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
            return { ...doc, disabled: optionalSelectedDocuments.includes(doc.id) ?? false };
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
                    {i18n.get('dispute.uploadDefenseDocumentsInformation')}
                </Typography>
                <Card
                    renderHeader={
                        <Typography variant={TypographyVariant.BODY} stronger className={'adyen-pe-defend-dispute-document-requirements'}>
                            {i18n.get('dispute.documentRequirements')}
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
                    <div className="adyen-pe-defend-dispute-document-upload-box">
                        <div className="adyen-pe-defend-dispute-document-upload-box__required-documents">
                            {requiredDocuments?.map(document => {
                                return (
                                    <DefendDocumentUpload
                                        key={document}
                                        document={document}
                                        ref={ref}
                                        addFileToDefendPayload={addFileToDefendPayload}
                                        isRequired
                                    />
                                );
                            })}
                        </div>

                        {oneOrMoreDocuments.length ? (
                            <SelectAndUploadOptionalDoc
                                selection={oneOrMoreSelectedDocument}
                                setSelection={(val: string) => setOneOrMoreSelectedDocument(val)}
                                items={oneOrMoreDocuments}
                                ref={ref}
                                title={i18n.get('disputes.extraRequiredDocuments')}
                                required
                            />
                        ) : null}
                    </div>
                    {optionalSelectedDocuments.length
                        ? optionalSelectedDocuments.map((doc, index) => {
                              return (
                                  <div key={doc} className="adyen-pe-defend-dispute-document-upload-box">
                                      <SelectAndUploadOptionalDoc
                                          onRemoveOption={removeSelectedOptionalDocument}
                                          selection={doc}
                                          setSelection={addOptionalDocument}
                                          index={index}
                                          items={availableOptionalDocuments}
                                          ref={ref}
                                          title={i18n.get('disputes.optionalDocument')}
                                          required
                                      />
                                  </div>
                              );
                          })
                        : null}
                    <Button onClick={addEmptyOptionalDocument} variant={ButtonVariant.SECONDARY} fullWidth align="center">
                        <Icon name="plus" />
                        {i18n.get('disputes.addOptionalDocument')}
                    </Button>
                </div>
                <div className={'adyen-pe-defend-file-uploader__actions'}>
                    <ButtonActions actions={actionButtons} />
                </div>
            </>
        </>
    );
};
