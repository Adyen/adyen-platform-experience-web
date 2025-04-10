import cx from 'classnames';
import { RefObject } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { fixedForwardRef } from '../../../../../utils/preact';
import Typography from '../../../Typography/Typography';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useFocusVisibility from '../../../../../hooks/element/useFocusVisibility';
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
    dropzoneError: `${BASE_CLASS}__dropzone--error`,
    dropzoneHover: `${BASE_CLASS}__dropzone--hover`,
    label: `${BASE_CLASS}__label`,
    labelDefault: `${BASE_CLASS}__label-default-content`,
    labelIcon: `${BASE_CLASS}__label-icon`,
    labelText: `${BASE_CLASS}__label-text`,
    labelWithFocus: `${BASE_CLASS}__label--with-focus`,
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
    const { hasVisibleFocus, ref: inputRef } = useFocusVisibility(ref);
    const [inputError, setInputError] = useState<ValidationError | ''>('');
    const [zoneHover, setZoneHover] = useState(false);

    const isInvalid = !!inputError;
    const inputName = name?.trim();
    const inputId = useMemo(() => id || uniqueId(), [id]);

    const handleDragOver = (event: DragEvent) => {
        const hasFiles = Array.from(event.dataTransfer?.types ?? []).some(type => type === 'Files');
        if (hasFiles) {
            event.preventDefault();
            setZoneHover(true);
        }
    };

    const handleDragLeave = (event: DragEvent) => {
        event.preventDefault();
        setZoneHover(false);
    };

    const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        setZoneHover(false);
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
        const inputElement = (inputRef as RefObject<HTMLInputElement>).current;

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
                    [classes.dropzoneError]: isInvalid,
                    [classes.dropzoneHover]: zoneHover,
                })}
                onDragOver={disabled ? undefined : handleDragOver}
                onDragLeave={disabled ? undefined : handleDragLeave}
                onDrop={disabled ? undefined : handleDrop}
            >
                {/* Using the label element here to expose a user interaction surface for the file input element. */}
                {/* The input element itself is visually hidden (not visible), but available to assistive technology. */}
                <label className={cx(classes.label, { [classes.labelWithFocus]: hasVisibleFocus })} htmlFor={inputId}>
                    {children ?? (
                        <div className={cx(classes.labelDefault)}>
                            {
                                // prettier-ignore
                                isInvalid
                                    ? <Icon name="warning-filled" className={classes.labelIcon} />
                                    : <Icon name="upload" className={classes.labelIcon} />
                            }
                            <Typography
                                /* Using the styles for the tertiary button here to have the same look and feel */
                                className={cx(classes.labelText, 'adyen-pe-button', 'adyen-pe-button--tertiary')}
                                el={TypographyElement.SPAN}
                                variant={TypographyVariant.BODY}
                                stronger
                            >
                                {i18n.get('uploadFile.browse')}
                            </Typography>
                        </div>
                    )}
                </label>

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
