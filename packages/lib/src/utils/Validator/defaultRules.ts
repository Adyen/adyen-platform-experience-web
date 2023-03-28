export default {
    input: {
        default: () => true,
    },
    blur: {
        shopperEmail: (email: string) => /\S+@\S+\.\S+/.test(email),
        default: () => true,
    },
};
