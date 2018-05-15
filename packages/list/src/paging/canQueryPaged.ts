import { QueryParams } from '../odata';

export interface CanQueryPaged<TPaged> {
    queryPaged(params: QueryParams, prev: Array<QueryParams>): Promise<TPaged>;
}
