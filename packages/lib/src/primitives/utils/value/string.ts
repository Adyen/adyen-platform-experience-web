export const capitalize = (str?: string) => (str && str?.length > 0 ? `${str[0]!.toUpperCase()}${str.slice(1)}` : str);
