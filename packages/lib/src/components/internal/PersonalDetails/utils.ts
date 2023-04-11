import { unformatDate } from '../FormFields/InputDate/utils';
import { PersonalDetailsSchema } from '../../../types';

export const getFormattedData = (data: PersonalDetailsSchema) => {
    const { firstName, lastName, gender, dateOfBirth, shopperEmail, telephoneNumber } = data;

    return {
        ...((firstName || lastName) && {
            shopperName: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(gender && { gender }),
            },
        }),
        ...(dateOfBirth && { dateOfBirth: unformatDate(dateOfBirth) }),
        ...(shopperEmail && { shopperEmail }),
        ...(telephoneNumber && { telephoneNumber }),
    };
};
