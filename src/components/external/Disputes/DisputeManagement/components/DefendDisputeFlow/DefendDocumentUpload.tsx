import FileInput from '../../../../../internal/FormFields/FileInput/FileInput';
import { getDefenseDocumentContent } from '../../utils';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
import Typography from '../../../../../internal/Typography/Typography';
import { useMemo } from 'preact/hooks';
import { useDisputeFlow } from '../../context/dispute/context';
import { ALLOWED_FILE_TYPES, DOCUMENT_MAX_SIZE } from './constants';
import { MapErrorCallback } from './types';

export const DefendDocumentUpload = ({
    document,
    disabled,
    required,
    mapError,
}: {
    document: string;
    disabled?: boolean;
    required: boolean;
    mapError: MapErrorCallback;
}) => {
    const { i18n } = useCoreContext();
    const { removeFieldFromDefendPayload, addFileToDefendPayload, defenseDocumentConfig } = useDisputeFlow();
    const { title, primaryDescriptionItems } =
        useMemo(() => getDefenseDocumentContent(defenseDocumentConfig, i18n, document), [defenseDocumentConfig, i18n, document]) || {};
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
                key={document}
                disabled={disabled}
                required={required}
                onChange={files => {
                    files[0] ? addFileToDefendPayload(document, files[0]) : removeFieldFromDefendPayload(document);
                }}
            />
        </div>
    );
};
