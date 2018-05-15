import { isGuid } from 'is-guid';
import { httpClient } from './config';
import { combineUrl, formatUrl, getContextWebUrl } from './httpClient';
import { ItemCollection } from './itemCollection';
import { GetItemQueryParams, QueryParams } from './odata';
import { parseItemCollection, parseOdata } from './parsers';
import { SpListPaged } from './spListPaged';

export class SpList {

    public readonly name: string;

    private readonly listApiUrl: string;
    private readonly defaultViewThreshold: number = 5000;

    public constructor(listName: string, webUrl: string = getContextWebUrl()) {

        this.name = listName;
        this.listApiUrl = isGuid(listName) ?
            combineUrl(webUrl, `/_api/lists/getById('${listName}')`) :
            combineUrl(webUrl, `/_api/lists/getByTitle('${listName}')`);
    }

    /**
     * Get item
     */
    public get<T>(itemId: number, params: GetItemQueryParams = {}): Promise<T> {

        const baseUrl: string = `${this.listApiUrl}/items/getById(${itemId})`;
        const url: string = formatUrl(baseUrl, params);
        return httpClient.get(url).then((json: any) => parseOdata<T>(json));
    }

    /**
     * Create item
     */
    public create<T>(item: T): Promise<T> {

        const url: string = `${this.listApiUrl}/items`;
        return this.ensureEntityTypeFullName(item)
            .then((spItem: any) => httpClient.post(url, { body: JSON.stringify(spItem) }))
            .then((json: any) => parseOdata<T>(json));
    }

    /**
     * Delete item
     */
    public delete(itemId: number, etag: string = '*'): Promise<void> {

        const url: string = `${this.listApiUrl}/items(${itemId})`;
        return httpClient.delete(url, {
            headers: {
                'IF-MATCH': etag,
                'X-HTTP-Method': 'DELETE'
            }
        });
    }

    /**
     * Get items
     */
    public query<T>(params: QueryParams = {}): Promise<Array<T>> {

        return this.queryAsCollection<T>(params).then((collection: ItemCollection<T>) => collection.items);
    }

    /**
     * Get all items
     */
    public async queryAll<T>(queryParams: QueryParams, viewThreshold: number = this.defaultViewThreshold): Promise<Array<T>> {

        const items: Array<T> = [];
        let params: QueryParams | undefined = { ...queryParams, $top: viewThreshold };
        do {
            const collection: ItemCollection<T> = await this.queryAsCollection<T>(params);
            params = collection.next;
            items.push(...collection.items);
        } while (params);
        return items;
    }

    /**
     * Get item collection
     * @returns An item collection with **next** page query parameters
     */
    public queryAsCollection<T>(params: QueryParams = {}): Promise<ItemCollection<T>> {

        const baseUrl: string = `${this.listApiUrl}/items`;
        const url: string = formatUrl(baseUrl, params);
        return httpClient.get(url).then((json: any) => parseItemCollection<T>(json, params));
    }

    /**
     * Get items paginated
     */
    public queryPaged<T>(params: QueryParams = {}, prev?: Array<QueryParams>): Promise<SpListPaged<T>> {

        return this.queryAsCollection<T>(params).then((collection: ItemCollection<T>) => new SpListPaged<T>(this, collection, params, prev));
    }

    /**
     * Update item
     */
    public update<T>(id: number, item: T, etag: string = '*'): Promise<void> {

        const url: string = `${this.listApiUrl}/items(${id})`;
        return this.ensureEntityTypeFullName(item)
            .then((spItem: any) => {
                return httpClient.post(url, {
                    body: JSON.stringify(spItem),
                    headers: {
                        'IF-MATCH': etag,
                        'X-HTTP-Method': 'MERGE'
                    }
                });
            });
    }

    private ensureEntityTypeFullName(item: any): Promise<string> {

        const url: string = formatUrl(this.listApiUrl, { $select: 'ListItemEntityTypeFullName' });
        return httpClient.get(url).then((json: any) => {
            const { ListItemEntityTypeFullName } = parseOdata<{ ListItemEntityTypeFullName: string }>(json);
            return {
                __metadata: { type: ListItemEntityTypeFullName },
                ...(item as any)
            };
        });
    }
}
