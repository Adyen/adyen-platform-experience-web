export type StatusType = 'booked' | 'active' | 'inactive' | 'pending' | 'closed';
export interface StatusProps<T extends StatusType = any> {
    label?: T;
    size: string;
    type: string;
}
