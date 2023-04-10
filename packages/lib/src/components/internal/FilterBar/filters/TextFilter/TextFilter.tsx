import BaseFilter from '../BaseFilter';
import { BaseFilterProps } from '../BaseFilter/types';

export default function TextFilter(props: BaseFilterProps) {
    return <BaseFilter {...props} type={'text'} />;
}
