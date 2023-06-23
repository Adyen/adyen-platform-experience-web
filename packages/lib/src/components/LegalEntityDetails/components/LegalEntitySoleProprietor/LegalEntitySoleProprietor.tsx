import { ILegalEntitySoleProprietor } from '../../types';
import StructuredList from '../../../internal/StructuredList/StructuredList';
import useCoreContext from '../../../../core/Context/useCoreContext';

function LegalEntitySoleProprietor({ legalEntity }: { legalEntity: ILegalEntitySoleProprietor }) {
    const { i18n } = useCoreContext();
    const { soleProprietorship } = legalEntity;
    const individualListItems = {
        id: legalEntity.id,
        legalEntityType: legalEntity.type,
        legalNameOfTheCompany: soleProprietorship.doingBusinessAs,
        name: soleProprietorship.name,
        residentialAddress: `${soleProprietorship.registeredAddress.street}${
            soleProprietorship.registeredAddress.street2 ? `, ${soleProprietorship.registeredAddress.street2}` : ''
        }, ${soleProprietorship.registeredAddress.city}`,
        countryOfResidence: soleProprietorship.registeredAddress.country,
        taxNumber: soleProprietorship.vatNumber,
        taxExempt: soleProprietorship.vatAbsenceReason ?? i18n.get('no'),
    };

    return <StructuredList layout={'3-9'} items={individualListItems} />;
}

export default LegalEntitySoleProprietor;
