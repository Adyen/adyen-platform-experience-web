import Icon from '../../../Icon';
import Button from '../../../Button/Button';
import Typography from '../../../Typography/Typography';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { TypographyElement, TypographyVariant } from '../../../Typography/types';
import { TranslationKey } from '../../../../../translations';
import { getHumanReadableFileSize } from '../../../../../utils';
import { ButtonVariant } from '../../../Button/types';
import { UploadedFileProps } from '../types';
import { BASE_CLASS } from '../constants';
import '../FileInput.scss';

const classes = {
    base: `${BASE_CLASS}__file`,
    fileButton: `${BASE_CLASS}__file-button`,
    fileDetails: `${BASE_CLASS}__file-details`,
    fileIcon: `${BASE_CLASS}__file-icon`,
    fileName: `${BASE_CLASS}__file-name`,
    fileSize: `${BASE_CLASS}__file-size`,
};

export function UploadedFile({ file, deleteFile }: UploadedFileProps) {
    const { i18n } = useCoreContext();
    return (
        <div className={classes.base}>
            <div className={classes.fileDetails}>
                <Icon name="checkmark-circle-fill" className={classes.fileIcon} />
                <Typography className={classes.fileName} el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                    {file.name}
                </Typography>
                <Typography className={classes.fileSize} el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                    {getHumanReadableFileSize(file.size)}
                </Typography>
            </div>
            <Button className={classes.fileButton} variant={ButtonVariant.TERTIARY} onClick={deleteFile}>
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
