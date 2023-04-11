import Fieldset from '../FormFields/Fieldset';
import { ReadOnlyPersonalDetailsProps } from './types';

const ReadOnlyPersonalDetails = ({ data }) => {
    const { firstName, lastName, shopperEmail, telephoneNumber }: ReadOnlyPersonalDetailsProps = data;

    return (
        <Fieldset classNameModifiers={['personalDetails']} label="personalDetails" readonly>
            {firstName && `${firstName} `}
            {lastName && `${lastName} `}
            {shopperEmail && (
                <>
                    <br />
                    {shopperEmail}
                </>
            )}
            {telephoneNumber && (
                <>
                    <br />
                    {telephoneNumber}
                </>
            )}
        </Fieldset>
    );
};

export default ReadOnlyPersonalDetails;
