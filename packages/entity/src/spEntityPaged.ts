import { ItemCollection, QueryParams } from '@sp-entity/list';
import { QueryablePaged } from '@sp-entity/list/lib/paging';
import { SpEntity } from './spEntity';

export class SpEntityPaged<TFields extends object, TItem extends object> extends QueryablePaged<TItem, SpEntityPaged<TFields, TItem>>  {

    public constructor(spEntity: SpEntity<TFields, TItem>, collection: ItemCollection<TItem>, params: QueryParams, prev?: Array<QueryParams>) {
        super(spEntity, collection, params, prev);
    }
}
