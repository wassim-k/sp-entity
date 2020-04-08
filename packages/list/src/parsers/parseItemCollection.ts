import * as queryString from 'query-string';
import { ItemCollection } from '../itemCollection';
import { QueryParams } from '../odata';

export function parseItemCollection<T>(json: any, params: QueryParams): ItemCollection<T> {

    let items: Array<T> = [];
    let nextLink: string | undefined;
    if (json.hasOwnProperty('d')) { // verbose
        items = json.d.results;
        nextLink = json.d.__next;
    } else if (json.hasOwnProperty('value')) { // non-verbose
        items = json.value;
        nextLink = json['odata.nextLink'];
    }
    return { items, next: getNextQueryParams(nextLink, params) };
}

function getNextQueryParams(next: string | undefined, params: QueryParams): QueryParams | undefined {
    if (next) {
        const qs: string = queryString.extract(next);
        let { $skiptoken } = queryString.parse(qs);
        $skiptoken = $skiptoken ? Array.isArray($skiptoken) ? $skiptoken.join() : $skiptoken : undefined;
        return { ...params, $skiptoken };
    }
    return undefined;
}
