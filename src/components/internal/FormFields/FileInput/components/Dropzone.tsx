import cx from 'classnames';
import { useState } from 'preact/hooks';
import { DropzoneProps } from '../types';
import { TranslationKey } from '../../../../../translations';
import { TypographyElement, TypographyVariant } from '../../../Typography/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Typography from '../../../Typography/Typography';
import Icon from '../../../Icon';
import '../FileInput.scss';

export function Dropzone({
    // [TODO]: Apply these ignored props to the file input element
    // id,
    // name,
    // label = '',
    disabled,
    required,
    allowedFileTypes,
    updateFiles,
}: DropzoneProps) {
    const { i18n } = useCoreContext();
    const [dragHover, setDragHover] = useState(false);

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

    return (
        <div
            role="region"
            className={cx('adyen-pe-file-input__dropzone', { 'adyen-pe-file-input__dropzone--drag-hover': dragHover })}
            onDragOver={disabled ? undefined : handleDragOver}
            onDragLeave={disabled ? undefined : handleDragLeave}
            onDrop={disabled ? undefined : handleDrop}
        >
            <label className="adyen-pe-file-input__label" htmlFor="input-field-id">
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
