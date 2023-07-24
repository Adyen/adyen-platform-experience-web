export type StatusType = 'booked' | 'active' | 'inactive' | 'pending';
export interface StatusProps {
    label: 'booked' | 'active' | 'inactive' | 'pending';
    size: string;
    type: string;
}
