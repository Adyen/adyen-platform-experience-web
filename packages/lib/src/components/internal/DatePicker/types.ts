import { CalendarProps } from '../Calendar/types';

export interface DatePickerProps extends CalendarProps {
    dateTime?: boolean;
    isRange?: boolean;
    onUpdated?: () => void;
}
