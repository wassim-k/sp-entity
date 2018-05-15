import { ItemCollection } from '../';
import { QueryParams } from '../odata';
import { CanQueryPaged } from './canQueryPaged';

export class QueryablePaged<TItem, TPaged> {

    public readonly items: Array<TItem>;
    private readonly queryable: CanQueryPaged<TPaged>;
    private params: QueryParams;
    private next: QueryParams | undefined;
    private prev: Array<QueryParams>;

    public constructor(queryable: CanQueryPaged<TPaged>, collection: ItemCollection<TItem>, params: QueryParams, prev: Array<QueryParams> = []) {

        this.queryable = queryable;
        this.items = collection.items;
        this.next = collection.next;
        this.params = params;
        this.prev = prev;
    }

    /**
     * Page index
     */
    public get page(): number {
        return this.prev.length;
    }

    public get hasNext(): boolean {
        return this.next !== undefined;
    }

    public get hasPrev(): boolean {
        return this.prev.length > 0;
    }

    public getNext(): Promise<TPaged> {

        if (!this.hasNext) {
            throw new Error(`Next is not available, check 'hasNext' property`);
        }

        return this.queryable.queryPaged(this.next as QueryParams, this.prev.concat(this.params));
    }

    public getPrev(): Promise<TPaged> {

        if (!this.hasPrev) {
            throw new Error(`Previous page is not available, check 'hasPrev' property`);
        }

        const prev: QueryParams = this.prev[this.prev.length - 1];
        return this.queryable.queryPaged(prev, this.prev.slice(0, -1));
    }

    /**
     * Reload current page
     */
    public refresh(): Promise<TPaged> {

        return this.queryable.queryPaged(this.params, this.prev);
    }
}
