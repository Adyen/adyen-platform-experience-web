import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Select from '../../../../internal/FormFields/Select';
import FileInput from '../../../../internal/FormFields/FileInput/FileInput';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { SelectItem } from '../../../../internal/FormFields/Select/types';
import { useDisputeFlow } from '../../context/dispute/context';
import { getDefenseDocumentContent } from '../../utils';
import { MutableRef, useCallback, useEffect } from 'preact/hooks';
import Button from '../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../internal/Button/types';
import Icon from '../../../../internal/Icon';

const SelectAndUploadOptionalDoc = ({
    items,
    selection,
    setSelection,
    ref,
    required,
    title,
    index,
    onRemoveOption,
}: {
    items: SelectItem[];
    selection: string | undefined;
    setSelection: (val: string, index?: number) => void;
    ref: MutableRef<HTMLInputElement | null>;
    required: boolean;
    title: string;
    index?: number;
    onRemoveOption?: (index: number) => void;
}) => {
    const { i18n } = useCoreContext();
    const { addFileToDefendPayload, moveFieldInDefendPayload, removeFieldFromDefendPayload } = useDisputeFlow();
    const getDocInfo = useCallback((document: string) => getDefenseDocumentContent(i18n, document), [i18n]);
    const updateDocumentSelection = useCallback(
        (documentSelection: string) => {
            selection && moveFieldInDefendPayload(selection, documentSelection);
            setSelection(documentSelection, index);
        },
        [index, moveFieldInDefendPayload, selection, setSelection]
    );

    useEffect(() => {
        const activeSelectItems = items.filter(({ disabled }) => disabled !== true);
        if (activeSelectItems.length === 1 && !selection) {
            updateDocumentSelection(activeSelectItems[0]!.id);
        }
    }, [items, selection, updateDocumentSelection]);

    return (
        <div className="">
            <div className="adyen-pe-defend-dispute-document-upload-box__extra-documents-selector">
                <div className="adyen-pe-defend-dispute-document-upload-box__delete-button-container">
                    <Typography
                        strongest
                        className="adyen-pe-defend-dispute-document-upload-box__extra-documents-selector-title"
                        variant={TypographyVariant.BODY}
                        el={TypographyElement.DIV}
                    >
                        {title}
                    </Typography>
                    {onRemoveOption && (
                        <Button
                            onClick={() => index !== undefined && onRemoveOption(index)}
                            variant={ButtonVariant.TERTIARY}
                            fullWidth={false}
                            align="center"
                        >
                            <Icon name="trash-can" />
                        </Button>
                    )}
                </div>
                <div>
                    <Select
                        onChange={val => {
                            const documentSelection = val.target.value;
                            updateDocumentSelection(documentSelection);
                        }}
                        filterable={false}
                        selected={selection}
                        multiSelect={false}
                        items={items}
                        showOverlay={false}
                        placeholder={i18n.get('disputes.uploadDocuments.selectDocumentType')}
                    />
                    {selection &&
                        getDocInfo(selection)?.primaryDescriptionItems?.map(desc => {
                            return (
                                <Typography
                                    key={desc}
                                    className="adyen-pe-defend-dispute-document-upload__description"
                                    variant={TypographyVariant.BODY}
                                    el={TypographyElement.PARAGRAPH}
                                >
                                    {desc}
                                </Typography>
                            );
                        })}
                </div>
                <FileInput
                    ref={ref}
                    disabled={!selection}
                    required={required}
                    onChange={files => {
                        if (selection) {
                            files[0] ? addFileToDefendPayload(selection, files[0]) : removeFieldFromDefendPayload(selection);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default SelectAndUploadOptionalDoc;
