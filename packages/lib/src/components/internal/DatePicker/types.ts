import { CalendarProps } from '../Calendar/types.old';

export interface DatePickerProps extends CalendarProps {
    dateTime?: boolean;
    isRange?: boolean;
    onUpdated?: () => void;
}
