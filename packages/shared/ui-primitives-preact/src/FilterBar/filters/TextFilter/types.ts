import { BaseFilterProps } from '../BaseFilter/types';

export interface TextFilterProps extends BaseFilterProps {
    onChange: (value?: string) => void;
}
