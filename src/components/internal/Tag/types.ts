export enum TagVariant {
    DEFAULT = 'default',
    WARNING = 'warning',
    ERROR = 'error',
    SUCCESS = 'success',
    WHITE = 'white',
    LIGHT = 'light',
    LIGHT_WITH_OUTLINE = 'light-with-outline',

    // Adapted from the latest Bento tag variants spec
    BLUE = 'blue',
}

export interface TagProps {
    variant?: TagVariant;
    label: string;
}
