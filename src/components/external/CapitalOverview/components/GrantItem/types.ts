import { IGrant } from '../../../../../types';
import { GrantDetailsViewCallback } from '../GrantDetailsView/types';
import { ListWithoutFirst } from '../../../../../utils/types';

export interface GrantItemProps {
    grant: IGrant;
    showDetailsView?: (...args: ListWithoutFirst<Parameters<GrantDetailsViewCallback>>) => ReturnType<GrantDetailsViewCallback>;
}
