import { GetTransferInstrumentById, ILegalEntityOrganization } from '../../types';
import StructuredList from '../../../internal/StructuredList/StructuredList';
import useCoreContext from '../../../../core/Context/useCoreContext';
import Tabs from '../../../internal/Tabs/Tabs';
import TransferInstrumentOverview from './TransferInstrumentOverview';

interface LegalEntityOrganizationProps {
    legalEntity: ILegalEntityOrganization;
    onGetTransferInstrument?: GetTransferInstrumentById;
}
function LegalEntityOrganization({ legalEntity, onGetTransferInstrument }: LegalEntityOrganizationProps) {
    const { i18n } = useCoreContext();
    const { organization } = legalEntity;
    const organizationListItems = {
        id: legalEntity.id,
        legalEntityType: legalEntity.type,
        legalNameOfTheCompany: organization.legalName,
        companyType: organization.type,
        tradingName: organization.legalName ?? '-',
        registrationNumber: organization.registrationNumber,
        taxNumber: organization.vatNumber,
        taxExempt: organization.vatAbsenceReason ?? i18n.get('no'),
        mobile: organization.phone?.type === 'mobile' ? organization.phone?.number : undefined,
        fax: organization.phone?.type === 'fax' ? organization.phone?.number : undefined,
        landline: organization.phone?.type === 'landline' ? organization.phone?.number : undefined,
        email: organization.email ?? '-',
        registeredBusinessAddress: `${organization.registeredAddress.street}${organization.registeredAddress.street}`,
        residentialAddress: `${organization.registeredAddress.street}${
            organization.registeredAddress.street2 ? `, ${organization.registeredAddress.street2}` : ''
        }, ${organization.registeredAddress.city}`,
        countryOfResidence: organization.registeredAddress.country,
    };
    return (
        <Tabs
            tabs={[
                {
                    label: 'overview',
                    content: <StructuredList items={organizationListItems} />,
                    id: 'overview',
                },
                {
                    label: 'transferInstruments',
                    content: (
                        <div>
                            {legalEntity.transferInstruments?.map(transferInstrument => (
                                <TransferInstrumentOverview
                                    transferInstrument={transferInstrument}
                                    key={transferInstrument.id}
                                    onGetTransferInstrument={onGetTransferInstrument}
                                />
                            ))}
                        </div>
                    ),
                    id: 'transferInstruments',
                    disabled: !legalEntity.transferInstruments || legalEntity.transferInstruments.length === 0,
                },
            ]}
        />
    );
}

export default LegalEntityOrganization;
