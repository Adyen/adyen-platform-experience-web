import { ReadOnlyCompanyDetailsProps } from './types';

export const getFormattedData = (data: ReadOnlyCompanyDetailsProps) => {
    const { name, registrationNumber } = data;
    return {
        ...((name || registrationNumber) && {
            company: {
                ...(name && { name }),
                ...(registrationNumber && { registrationNumber }),
            },
        }),
    };
};
