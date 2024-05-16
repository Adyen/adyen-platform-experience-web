import { Schema } from '../../../../../types/models/api/utils';
import { components } from '../../../../../types/models/openapi/TransactionsResource';

export type CategoryProps = {
    value: Schema<components, 'SingleTransaction'>['category'];
    isContainerHovered: boolean;
};
