import { Observable } from '../observable/types';

export type Today = {
    readonly timestamp: number;
    readonly watch: Observable['observe'];
};
