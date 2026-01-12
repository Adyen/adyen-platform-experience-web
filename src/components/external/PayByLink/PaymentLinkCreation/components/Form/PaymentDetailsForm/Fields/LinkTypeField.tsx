import { PaymentLinkCreationFormValues } from '../../../types';
import useCoreContext from '../../../../../../../../core/Context/useCoreContext';
import { useMemo } from 'preact/hooks';
import { FunctionalComponent } from 'preact';
import { IPaymentLinkConfiguration, IPaymentLinkType } from '../../../../../../../../types/api/models/payByLink';
import { TranslationKey } from '../../../../../../../../translations';
import { FormSelect } from '../../../../../../../internal/FormWrappers/FormSelect';

export type LinkTypeFieldProps = {
    configuration?: IPaymentLinkConfiguration;
};

const LINK_TYPE_FALLBACK = ['open', 'singleUse'] satisfies IPaymentLinkType[];

export const LinkTypeField: FunctionalComponent<LinkTypeFieldProps> = ({ configuration }) => {
    const { i18n } = useCoreContext();

    const linkTypes = useMemo(() => {
        const options = configuration?.linkType?.options?.length ? configuration?.linkType?.options : LINK_TYPE_FALLBACK;
        return options.map((type: IPaymentLinkType) => {
            const key: TranslationKey = `payByLink.creation.form.linkTypes.${type}`;
            return {
                id: type,
                name: i18n.get(key),
            };
        });
    }, [configuration, i18n]);

    return (
        <FormSelect<PaymentLinkCreationFormValues>
            fieldName="linkType"
            label={i18n.get('payByLink.creation.fields.linkType.label')}
            items={linkTypes}
        />
    );
};
