import Fieldset from '../FormFields/Fieldset';
import { ReadOnlyCompanyDetailsProps } from './types';

const ReadOnlyCompanyDetails = ({ data }: { data: ReadOnlyCompanyDetailsProps }) => {
    const { name, registrationNumber } = data;

    return (
        <Fieldset classNameModifiers={['companyDetails']} label="companyDetails" readonly>
            {name && `${name} `}
            {registrationNumber && `${registrationNumber} `}
        </Fieldset>
    );
};

export default ReadOnlyCompanyDetails;
