import { QueryParams } from './odata';

export interface ItemCollection<T> {
    items: Array<T>;
    next?: QueryParams;
}
