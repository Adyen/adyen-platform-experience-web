export const isValidURL = (termsAndConditionsURL: string) => {
    return termsAndConditionsURL === ''
        ? true
        : !termsAndConditionsURL
          ? false
          : termsAndConditionsURL.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
};
