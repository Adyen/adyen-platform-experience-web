import { Observable } from '../shared/observable/types';

export type Today = {
    readonly timestamp: number;
    readonly watch: Observable['observe'];
};
