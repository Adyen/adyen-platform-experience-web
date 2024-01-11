export enum TagVariant {
    DEFAULT = 'default',
    WARNING = 'warning',
    ERROR = 'error',
    SUCCESS = 'success',
}

export interface TagProps {
    variant?: TagVariant;
    label: string;
}
