import cx from 'classnames';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { fixedForwardRef } from '../../../../../utils/preact';
import Typography from '../../../Typography/Typography';
import useTrackedRef from '../../../../../hooks/useTrackedRef';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { BASE_CLASS, DEFAULT_FILE_TYPES, DEFAULT_MAX_FILE_SIZE, validationErrors } from '../constants';
import { getUploadedFilesFromSource, isFunction, uniqueId, UploadedFileSource } from '../../../../../utils';
import { TypographyElement, TypographyVariant } from '../../../Typography/types';
import { TranslationKey } from '../../../../../translations';
import { DropzoneProps, ValidationError } from '../types';
import Icon from '../../../Icon';
import '../FileInput.scss';

const classes = {
    dropzone: `${BASE_CLASS}__dropzone`,
    dropzoneDisabled: `${BASE_CLASS}__dropzone--disabled`,
    dropzoneDragOver: `${BASE_CLASS}__dropzone--dragover`,
    dropzoneError: `${BASE_CLASS}__dropzone--error`,
    label: `${BASE_CLASS}__label`,
    labelDefault: `${BASE_CLASS}__label-default-content`,
    labelIcon: `${BASE_CLASS}__label-icon`,
    labelText: `${BASE_CLASS}__label-text`,
    error: `${BASE_CLASS}__error`,
    errorIcon: `${BASE_CLASS}__error-icon`,
    errorText: `${BASE_CLASS}__error-text`,
};

export const Dropzone = fixedForwardRef<DropzoneProps, HTMLInputElement>((props, ref) => {
    const {
        id,
        name,
        children,
        disabled = false,
        required = false,
        maxFileSize = DEFAULT_MAX_FILE_SIZE,
        allowedFileTypes = DEFAULT_FILE_TYPES,
        mapError,
        uploadFiles,
    } = props;

    const { i18n } = useCoreContext();
    const [inputError, setInputError] = useState<ValidationError | ''>('');
    const [dragOver, setDragOver] = useState(false);

    const isInvalid = !!inputError;
    const inputName = name?.trim();
    const inputId = useMemo(() => id || uniqueId(), [id]);
    const inputRef = useTrackedRef(ref);

    const handleDragOver = (event: DragEvent) => {
        const hasFiles = Array.from(event.dataTransfer?.types ?? []).some(type => type === 'Files');
        if (hasFiles) {
            event.preventDefault();
            setDragOver(true);
        }
    };

    const handleDragLeave = (event: DragEvent) => {
        event.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        setDragOver(false);
        updateFiles(event.dataTransfer);
    };

    const handleFileChange = (event: Event) => {
        updateFiles(event.target as HTMLInputElement);
    };

    const handleInputBlur = async (event: FocusEvent) => {
        if (event.target !== document.activeElement) {
            (event.target as HTMLInputElement)?.checkValidity();
        }
    };

    const handleInputInvalid = async (event: Event) => {
        if (!inputError && (event.target as HTMLInputElement).validity.valueMissing) {
            // Since there is currently no other custom input validation message,
            // Replace the default "required" constraint validation message (if necessary)
            updateInputValidationError(validationErrors.FILE_REQUIRED);
        }
    };

    const updateInputValidationError = useCallback((error: string) => {
        const inputElement = inputRef.current;

        if (inputElement) {
            const currentRequired = inputElement.required;

            // Temporarily mark input as optional before accessing validation message,
            // to evade the default "required" constraint validation message.
            inputElement.required = false;
            inputElement.setCustomValidity(error);
            setInputError((inputElement.validationMessage as ValidationError) ?? '');

            // Restore the required state of the input
            inputElement.required = currentRequired;
        }
    }, []);

    const updateFiles = useCallback(
        <T extends UploadedFileSource>(source?: T | null): void => {
            const uploadedFiles = getUploadedFilesFromSource(source);

            if (uploadedFiles.length > 1) {
                return updateInputValidationError(validationErrors.TOO_MANY_FILES);
            }

            try {
                const allowedFiles = uploadedFiles.filter(file => {
                    if (!allowedFileTypes.includes(file.type)) {
                        throw validationErrors.DISALLOWED_FILE_TYPE;
                    }
                    if (file.size > maxFileSize) {
                        throw validationErrors.VERY_LARGE_FILE;
                    }
                    return true;
                });

                updateInputValidationError('');
                uploadFiles(allowedFiles);
            } catch (ex) {
                switch (ex) {
                    case validationErrors.DISALLOWED_FILE_TYPE:
                    case validationErrors.VERY_LARGE_FILE:
                        return updateInputValidationError(ex);
                }
            }
        },
        [allowedFileTypes, maxFileSize, updateInputValidationError, uploadFiles]
    );

    return (
        <>
            <div
                role="region"
                className={cx(classes.dropzone, {
                    [classes.dropzoneDisabled]: disabled,
                    [classes.dropzoneDragOver]: dragOver,
                    [classes.dropzoneError]: isInvalid,
                })}
                onDragOver={disabled ? undefined : handleDragOver}
                onDragLeave={disabled ? undefined : handleDragLeave}
                onDrop={disabled ? undefined : handleDrop}
            >
                <input
                    type="file"
                    className="adyen-pe-visually-hidden"
                    id={inputId}
                    ref={inputRef}
                    name={inputName}
                    disabled={disabled}
                    required={required}
                    accept={String(allowedFileTypes)}
                    onBlur={handleInputBlur}
                    onChange={handleFileChange}
                    onInvalid={handleInputInvalid}
                    aria-invalid={isInvalid}
                    data-testId="dropzone-input"
                />

                {/* Using the label element here to expose a user interaction surface for the file input element. */}
                {/* The input element itself is visually hidden (not visible), but available to assistive technology. */}
                {/* To preserve proper focus styling, this label element should always come after the input element. */}
                <label className={classes.label} htmlFor={inputId}>
                    {children ?? (
                        <div className={cx(classes.labelDefault)}>
                            {
                                // prettier-ignore
                                isInvalid
                                    ? <Icon name="warning-filled" className={classes.labelIcon} />
                                    : <Icon name="upload" className={classes.labelIcon} />
                            }
                            <Typography className={classes.labelText} el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                                {i18n.get('uploadFile.browse')}
                            </Typography>
                        </div>
                    )}
                </label>
            </div>
            {isInvalid && (
                <div className={classes.error}>
                    <Icon name="cross-circle-fill" className={classes.errorIcon} />
                    <Typography className={classes.errorText} el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                        {i18n.get(isFunction(mapError) ? mapError(inputError) : (inputError as TranslationKey))}
                    </Typography>
                </div>
            )}
        </>
    );
});

export default Dropzone;
