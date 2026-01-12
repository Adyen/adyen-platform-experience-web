import cx from 'classnames';
import { containerQueries, useResponsiveContainer } from '../../../../../../hooks/useResponsiveContainer';
import Typography from '../../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
import Select from '../../../../../internal/FormFields/Select';
import FileInput from '../../../../../internal/FormFields/FileInput/FileInput';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { SelectItem } from '../../../../../internal/FormFields/Select/types';
import { useDisputeFlow } from '../../context/dispute/context';
import { getDefenseDocumentContent } from '../../utils';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import Button from '../../../../../internal/Button/Button';
import { ButtonVariant } from '../../../../../internal/Button/types';
import Icon from '../../../../../internal/Icon';
import { ALLOWED_FILE_TYPES, DOCUMENT_MAX_SIZE } from './constants';
import { MapErrorCallback } from './types';

const BASE_CLASS = 'adyen-pe-defend-dispute-document-upload-box';

const classes = {
    deleteButton: BASE_CLASS + '__delete-button-container',
    dropdownList: BASE_CLASS + '__dropdown-list',
    dropdownListMobile: BASE_CLASS + '__dropdown-list--mobile',
    extraDocuments: BASE_CLASS + '__extra-documents-selector',
    extraDocumentsTitle: BASE_CLASS + '__extra-documents-selector-title',
};

const SelectAndUploadOptionalDoc = ({
    items,
    selection,
    setSelection,
    disabled,
    required,
    title,
    index,
    onRemoveOption,
    mapError,
}: {
    items: SelectItem[];
    selection: string | undefined;
    setSelection: (val: string, index?: number) => void;
    disabled?: boolean;
    required: boolean;
    title: string;
    index?: number;
    onRemoveOption?: (index: number) => void;
    mapError: MapErrorCallback;
}) => {
    const { i18n } = useCoreContext();
    const { addFileToDefendPayload, moveFieldInDefendPayload, removeFieldFromDefendPayload, defenseDocumentConfig } = useDisputeFlow();
    const documentSelectLabel = useMemo(() => i18n.get('disputes.management.defend.common.inputs.documentSelect.a11y.label'), [i18n]);
    const isMobileContainer = useResponsiveContainer(containerQueries.down.xs);

    const getDocInfo = useCallback(
        (document: string) => getDefenseDocumentContent(defenseDocumentConfig, i18n, document),
        [defenseDocumentConfig, i18n]
    );

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
        <div className={classes.extraDocuments}>
            <div className={classes.deleteButton}>
                <Typography strongest className={classes.extraDocumentsTitle} variant={TypographyVariant.BODY} el={TypographyElement.DIV}>
                    {title}
                </Typography>
                {onRemoveOption && (
                    <Button
                        disabled={disabled}
                        aria-label={i18n.get('disputes.management.defend.common.actions.deleteOptionalDocument')}
                        onClick={() => index !== undefined && !disabled && onRemoveOption(index)}
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
                    items={items}
                    filterable={false}
                    multiSelect={false}
                    showOverlay={false}
                    selected={selection}
                    readonly={disabled}
                    aria-label={documentSelectLabel}
                    placeholder={documentSelectLabel}
                    popoverClassNameModifiers={[cx(classes.dropdownList, { [classes.dropdownListMobile]: isMobileContainer })]}
                    fixedPopoverPositioning
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
                maxFileSize={type => {
                    return DOCUMENT_MAX_SIZE[type as keyof typeof DOCUMENT_MAX_SIZE];
                }}
                allowedFileTypes={ALLOWED_FILE_TYPES}
                mapError={mapError}
                onDelete={() => {
                    selection && removeFieldFromDefendPayload(selection);
                }}
                disabled={disabled || !selection}
                required={required}
                onChange={files => {
                    if (selection) {
                        files[0] ? addFileToDefendPayload(selection, files[0]) : removeFieldFromDefendPayload(selection);
                    }
                }}
            />
        </div>
    );
};

export default SelectAndUploadOptionalDoc;
