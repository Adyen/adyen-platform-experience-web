import FileInput from '../../../../internal/FormFields/FileInput/FileInput';
import { getDefenseDocumentContent } from '../../utils';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { MutableRef, useMemo } from 'preact/hooks';
import { useDisputeFlow } from '../../context/dispute/context';
import { ValidationError } from '../../../../internal/FormFields/FileInput/types';
import { TranslationKey } from '../../../../../translations';
import { ALLOWED_FILE_TYPES, DOCUMENT_MAX_SIZE } from './constants';

export const DefendDocumentUpload = ({
    document,
    ref,
    isRequired,
    mapError,
}: {
    document: string;
    ref: MutableRef<HTMLInputElement | null>;
    isRequired: boolean;
    mapError: (error: ValidationError) => TranslationKey;
}) => {
    const { i18n } = useCoreContext();
    const { title, primaryDescriptionItems } = useMemo(() => getDefenseDocumentContent(i18n, document), [i18n, document]) || {};
    const { removeFieldFromDefendPayload, addFileToDefendPayload } = useDisputeFlow();
    return (
        <div className="adyen-pe-defend-dispute-document-upload">
            <div>
                <Typography
                    strongest
                    className="adyen-pe-defend-dispute-document-upload__title"
                    variant={TypographyVariant.BODY}
                    el={TypographyElement.DIV}
                >
                    {title || document}
                </Typography>
                {primaryDescriptionItems && primaryDescriptionItems.length > 0
                    ? primaryDescriptionItems.map((desc, i) => {
                          return (
                              <Typography
                                  key={`${i}-description`}
                                  className="adyen-pe-defend-dispute-document-upload__description"
                                  variant={TypographyVariant.BODY}
                              >
                                  {desc}
                              </Typography>
                          );
                      })
                    : null}
            </div>
            <FileInput
                allowedFileTypes={ALLOWED_FILE_TYPES}
                maxFileSize={type => {
                    return DOCUMENT_MAX_SIZE[type as keyof typeof DOCUMENT_MAX_SIZE];
                }}
                mapError={mapError}
                onDelete={() => {
                    document && removeFieldFromDefendPayload(document);
                }}
                ref={ref}
                key={document}
                required={isRequired}
                onChange={files => {
                    files[0] ? addFileToDefendPayload(document, files[0]) : removeFieldFromDefendPayload(document);
                }}
            />
        </div>
    );
};
