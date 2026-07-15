export const isValidURL = (termsAndConditionsURL: string) => {
    if (termsAndConditionsURL === '') return true;
    try {
        new URL(termsAndConditionsURL);
        return true;
    } catch {
        return false;
    }
};
