export enum TagVariant {
    DEFAULT = 'default',
    WARNING = 'warning',
    ERROR = 'error',
    SUCCESS = 'success',
    WHITE = 'white',
}

export interface TagProps {
    variant?: TagVariant;
    label: string;
}
