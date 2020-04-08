import { GetItemQueryParams, ItemCollection, QueryParams, SpList } from '@sp-entity/list';
import { EntityMapper } from './mapper';
import { SpEntityPaged } from './spEntityPaged';

export class SpEntity<TFields extends object, TItem extends object> {

    public readonly listName: string;
    public readonly fields: TFields;

    private readonly spList: SpList;
    private readonly defaultQueryParams: QueryParams;
    private readonly mapper: EntityMapper<TFields, TItem>;

    public constructor(listName: string, fields: TFields, webUrl?: string) {
        this.spList = new SpList(listName, webUrl);
        this.mapper = new EntityMapper(fields);
        const { $select } = this.mapper;
        this.defaultQueryParams = { $select };
        this.listName = this.spList.name;
        this.fields = this.mapper.fields;
    }

    /**
     * Get item
     */
    public get(itemId: number, params: GetItemQueryParams = this.defaultQueryParams): Promise<TItem> {
        return this.spList.get<object>(itemId, params).then((odataItem: object) => this.mapper.mapItem(odataItem));
    }

    /**
     * Create item
     */
    public create(entity: Partial<TItem>): Promise<TItem> {
        const updates: object = this.mapper.mapUpdates(entity);
        return this.spList.create(updates).then((item: object) => this.mapper.mapItem(item));
    }

    /**
     * Delete item
     */
    public delete(itemId: number, etag?: string): Promise<void> {
        return this.spList.delete(itemId, etag);
    }

    /**
     * Get items
     */
    public query(params: QueryParams = this.defaultQueryParams): Promise<Array<TItem>> {
        return this.spList.query<Array<object>>(params).then((spItems: Array<object>) => this.mapper.mapItems(spItems));
    }

    /**
     * Get all items
     */
    public queryAll(params: QueryParams = this.defaultQueryParams, viewThreshold?: number): Promise<Array<TItem>> {
        return this.spList.queryAll<Array<object>>(params, viewThreshold).then((spItems: Array<object>) => this.mapper.mapItems(spItems));
    }

    /**
     * Get item collection
     * @returns An item collection with **next** page query parameters
     */
    public queryAsCollection(params: QueryParams = this.defaultQueryParams): Promise<ItemCollection<TItem>> {
        return this.spList.queryAsCollection<Array<object>>(params)
            .then((collection: ItemCollection<object>) => ({
                items: this.mapper.mapItems(collection.items),
                next: collection.next
            }));
    }

    /**
     * Get items paginated
     */
    public queryPaged(params: QueryParams = this.defaultQueryParams, prev?: Array<QueryParams>): Promise<SpEntityPaged<TFields, TItem>> {
        return this.queryAsCollection(params).then((collection: ItemCollection<TItem>) => new SpEntityPaged(this, collection, params, prev));
    }

    /**
     * Update item
     */
    public update(item: Partial<TItem>, etag?: string): Promise<void> {
        const updates: { [key: string]: any } = this.mapper.mapUpdates(item);
        const { Id, ID, ...rest } = updates;
        if (Id === undefined && ID === undefined) throw new Error('Id is required for an item update');
        return this.spList.update(Id || ID, rest, etag);
    }
}
