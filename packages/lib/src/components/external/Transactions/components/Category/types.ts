import { Schema } from '@src/types/models/api/utils';
import { components } from '@src/types/models/openapi/TransactionsResource';

export type CategoryProps = {
    value: Schema<components, 'SingleTransaction'>['category'];
};
