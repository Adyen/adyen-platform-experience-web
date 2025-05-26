import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Select from '../../../../internal/FormFields/Select';
import FileInput from '../../../../internal/FormFields/FileInput/FileInput';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { SelectItem } from '../../../../internal/FormFields/Select/types';
import { useDisputeFlow } from '../../context/dispute/context';
import { getDefenseDocumentContent } from '../../utils';
import { MutableRef } from 'preact/hooks';
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
    const { addFileToDefendPayload, moveFieldInDefendPayload } = useDisputeFlow();
    const getDocInfo = (document: string) => getDefenseDocumentContent(i18n, document);

    return (
        <div className="">
            <div className="adyen-pe-defend-dispute-document-upload-box__extra-documents-selector">
                <div className="adyen-pe-defend-dispute-document-upload-box__delete-button-container">
                    <Typography
                        strongest
                        className="adyen-pe-defend-dispute-document-upload-box__extra-documents-selector-title"
                        variant={TypographyVariant.BODY}
                        el={TypographyElement.SPAN}
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
                            selection && moveFieldInDefendPayload(selection, val.target.value);
                            val.target.value && setSelection(val.target.value, index);
                        }}
                        filterable={false}
                        selected={selection}
                        multiSelect={false}
                        items={items}
                        showOverlay={false}
                        placeholder={i18n.get('disputes.selectDocumentType')}
                    />
                    {selection &&
                        getDocInfo(selection)?.description?.map(desc => {
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
                    onChange={file => {
                        if (file[0] && selection) addFileToDefendPayload(selection, file[0]);
                    }}
                />
            </div>
        </div>
    );
};

export default SelectAndUploadOptionalDoc;
