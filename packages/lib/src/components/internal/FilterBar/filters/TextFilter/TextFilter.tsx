import BaseFilter from '../BaseFilter';
import { FilterProps } from '../BaseFilter/types';
import { TextFilterProps } from './types';

export default function TextFilter<T extends TextFilterProps = TextFilterProps>(props: FilterProps<T>) {
    const getAppliedFilterNumber = (): number => {
        return props.value ? 1 : 0;
    };

    return <BaseFilter<T> {...props} type={'text'} appliedFilterAmount={getAppliedFilterNumber()} />;
}
