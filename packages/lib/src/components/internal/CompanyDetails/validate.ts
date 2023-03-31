export const companyDetailsValidationRules = {
    default: {
        validate: (value: string) => {
            return value && value.length > 0;
        },
        modes: ['blur'],
    },
};
