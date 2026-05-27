import BaseFilter from '../BaseFilter';
import { FilterProps } from '../BaseFilter/types';
import { TextFilterProps } from './types';

export default function TextFilter<T extends TextFilterProps = TextFilterProps>(props: FilterProps<T>) {
    return <BaseFilter<T> {...props} type="text" />;
}
