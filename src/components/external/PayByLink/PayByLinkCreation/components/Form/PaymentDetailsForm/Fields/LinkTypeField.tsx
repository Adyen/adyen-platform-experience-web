import { PBLFormValues } from '../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useMemo } from 'preact/hooks';
import { FunctionalComponent } from 'preact';
import { PaymentLinkConfiguration, PaymentLinkTypeDTO } from '../../../../../../../../types/api/models/payByLink';
import { TranslationKey } from '../../../../../../../../translations';
import { FormSelect } from '../../../../../../../internal/FormWrappers/FormSelect';

export type LinkTypeFieldProps = {
    configuration?: PaymentLinkConfiguration;
};

export const LinkTypeField: FunctionalComponent<LinkTypeFieldProps> = ({ configuration }) => {
    const { i18n } = useCoreContext();

    const linkTypes = useMemo(() => {
        const options = configuration?.linkType?.options ?? [];
        return options.map(type => {
            const key = `payByLink.linkCreation.form.linkTypes.${type}` as TranslationKey;
            return {
                id: type as PaymentLinkTypeDTO,
                name: i18n.get(key),
            };
        });
    }, [configuration, i18n]);

    return <FormSelect<PBLFormValues> fieldName="linkType" label={i18n.get('payByLink.linkCreation.fields.linkType.label')} items={linkTypes} />;
};
