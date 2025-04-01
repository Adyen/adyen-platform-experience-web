import Icon from '../../../Icon';
import Button from '../../../Button/Button';
import Typography from '../../../Typography/Typography';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { TypographyElement, TypographyVariant } from '../../../Typography/types';
import { TranslationKey } from '../../../../../translations';
import { getHumanReadableFileSize } from '../../../../../utils';
import { ButtonVariant } from '../../../Button/types';
import { UploadedFileProps } from '../types';
import '../FileInput.scss';

export function UploadedFile({ file, deleteFile }: UploadedFileProps) {
    const { i18n } = useCoreContext();
    return (
        <div className="adyen-pe-file-input__file">
            <div className="adyen-pe-file-input__file-details">
                <Icon name="checkmark-circle-fill" className="adyen-pe-file-input__file-icon" />
                <Typography className="adyen-pe-file-input__file-name" el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                    {file.name}
                </Typography>
                <Typography className="adyen-pe-file-input__file-size" el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                    {getHumanReadableFileSize(file.size)}
                </Typography>
            </div>
            <Button className="adyen-pe-file-input__file-button" variant={ButtonVariant.TERTIARY} onClick={deleteFile}>
                <Icon name="trash-can" />
                <span className="adyen-pe-visually-hidden">
                    {/* [TODO]: Add translation key entry for this literal string: 'Delete [fileName] file' */}
                    {i18n.get(`Discard ${file.name} file` as TranslationKey)}
                </span>
            </Button>
        </div>
    );
}

export default UploadedFile;
