import { IGrant } from '../../../../../types';
import { GrantAccountDisplayCallback } from '../GrantList/types';
import { ListWithoutFirst } from '../../../../../utils/types';

export interface GrantItemProps {
    displayAccount?: (...args: ListWithoutFirst<Parameters<GrantAccountDisplayCallback>>) => ReturnType<GrantAccountDisplayCallback>;
    grant: IGrant;
}
