export const validatePhoneNumber = (phoneNumber: string, minLength = 3) => !!phoneNumber && phoneNumber.length >= minLength;

export default { validatePhoneNumber };
