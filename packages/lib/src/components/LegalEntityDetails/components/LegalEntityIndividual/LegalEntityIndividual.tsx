import { ILegalEntityIndividual } from '../../types';
import StructuredList from '@src/components/internal/StructuredList';
function LegalEntityIndividual({ legalEntity }: { legalEntity: ILegalEntityIndividual }) {
    const { individual } = legalEntity;

    return (
        <StructuredList
            layout={'3-9'}
            items={{
                id: legalEntity.id,
                legalEntityType: legalEntity.type,
                name: `${individual.name.firstName}${individual.name.lastName}`,
                mobile: individual.phone?.type === 'mobile' ? individual.phone?.number : undefined,
                fax: individual.phone?.type === 'fax' ? individual.phone?.number : undefined,
                landline: individual.phone?.type === 'landline' ? individual.phone?.number : undefined,
                email: individual.email,
                dateOfBirth: individual.birthData?.dateOfBirth,
                residentialAddress: `${individual.residentialAddress.street}${
                    individual.residentialAddress.street2 ? `, ${individual.residentialAddress.street2}` : ''
                }, ${individual.residentialAddress.city}`,
                countryOfResidence: individual.residentialAddress.country,
            }}
        />
    );
}

export default LegalEntityIndividual;
