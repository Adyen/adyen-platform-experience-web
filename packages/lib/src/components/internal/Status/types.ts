export type StatusType = 'booked' | 'active' | 'inactive';
export interface StatusProps {
    label: StatusType;
    size: string;
    type: string;
}
