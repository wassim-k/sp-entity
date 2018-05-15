import { ItemCollection } from './itemCollection';
import { QueryParams } from './odata';
import { QueryablePaged } from './paging';
import { SpList } from './spList';

export class SpListPaged<TItem = any> extends QueryablePaged<TItem, SpListPaged<TItem>> {

    public constructor(spList: SpList, collection: ItemCollection<TItem>, params: QueryParams, prev?: Array<QueryParams>) {
        super(spList, collection, params, prev);
    }
}
