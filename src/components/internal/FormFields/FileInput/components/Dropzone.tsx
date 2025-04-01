import cx from 'classnames';
import { useCallback, useState } from 'preact/hooks';
import Typography from '../../../Typography/Typography';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import useFocusVisibility from '../../../../../hooks/element/useFocusVisibility';
import { getUploadedFilesFromSource, UploadedFileSource } from '../../../../../utils';
import { TypographyElement, TypographyVariant } from '../../../Typography/types';
import { DEFAULT_FILE_TYPES, DEFAULT_MAX_FILE_SIZE } from '../constants';
import { TranslationKey } from '../../../../../translations';
import { DropzoneProps } from '../types';
import Icon from '../../../Icon';
import '../FileInput.scss';

export function Dropzone({
    // [TODO]: Apply these ignored props to the file input element
    // id,
    // name,
    // label = '',
    disabled = false,
    required = false,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    allowedFileTypes = DEFAULT_FILE_TYPES,
    setFiles,
}: DropzoneProps) {
    const [dragHover, setDragHover] = useState(false);
    const { hasVisibleFocus, ref: inputRef } = useFocusVisibility<HTMLInputElement>();
    const { i18n } = useCoreContext();

    const handleDragOver = (event: DragEvent) => {
        const hasFiles = Array.from(event.dataTransfer?.types ?? []).some(type => type === 'Files');
        if (hasFiles) {
            event.preventDefault();
            setDragHover(true);
        }
    };

    const handleDragLeave = (event: DragEvent) => {
        event.preventDefault();
        setDragHover(false);
    };

    const handleDrop = (event: DragEvent) => {
        event.preventDefault();
        setDragHover(false);
        updateFiles(event.dataTransfer);
    };

    const handleFileChange = (event: Event) => {
        updateFiles(event.target as HTMLInputElement);
    };

    const updateFiles = useCallback(
        <T extends UploadedFileSource>(source?: T | null) => {
            const allowedFiles = getUploadedFilesFromSource(source).filter(file => {
                return file.size <= maxFileSize && allowedFileTypes.includes(file.type);
            });
            setFiles(allowedFiles.slice(0, 1));
        },
        [allowedFileTypes, maxFileSize, setFiles]
    );

    return (
        <div
            role="region"
            className={cx('adyen-pe-file-input__dropzone', { 'adyen-pe-file-input__dropzone--drag-hover': dragHover })}
            onDragOver={disabled ? undefined : handleDragOver}
            onDragLeave={disabled ? undefined : handleDragLeave}
            onDrop={disabled ? undefined : handleDrop}
        >
            <label
                className={cx('adyen-pe-file-input__label', { 'adyen-pe-file-input__label--with-focus-ring': hasVisibleFocus })}
                htmlFor="input-field-id"
            >
                <i className="adyen-pe-file-input__label-icon">
                    <Icon name="upload" />
                </i>
                <Typography
                    className="adyen-pe-file-input__label-text adyen-pe-button adyen-pe-button--tertiary"
                    el={TypographyElement.SPAN}
                    variant={TypographyVariant.BODY}
                >
                    {/* [TODO]: Add translation key entry for this literal string: 'Browse files' */}
                    {i18n.get('Browse files' as TranslationKey)}
                </Typography>
                <input
                    type="file"
                    id="input-field-id"
                    className="adyen-pe-file-input__field adyen-pe-visually-hidden"
                    ref={inputRef}
                    disabled={disabled}
                    multiple={false}
                    accept={String(allowedFileTypes)}
                    onChange={handleFileChange}
                    aria-required={required}
                />
            </label>
        </div>
    );
}

export default Dropzone;
