import { BaseFilterProps } from '../BaseFilter/types';

export interface DateFilterProps extends BaseFilterProps {
    from?: string;
    to?: string;
}
