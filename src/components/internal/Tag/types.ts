export enum TagVariant {
    DEFAULT = 'default',
    WARNING = 'warning',
    ERROR = 'error',
    SUCCESS = 'success',
    LIGHT = 'light',
    LIGHT_WITH_OUTLINE = 'light-with-outline',
}

export interface TagProps {
    variant?: TagVariant;
    label: string;
}
