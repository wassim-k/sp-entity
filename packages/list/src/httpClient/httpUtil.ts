import queryString from 'query-string';
import { OrderByQueryParam, QueryParams } from '../odata';

export function combineUrl(left: string, right: string): string {

    if (!left) { return right; }
    if (!right) { return left; }

    const l: string = left.slice(-1) === '/' ? left.slice(0, -1) : left;
    const r: string = right.slice(0, 1) === '/' ? right.slice(1) : right;
    return `${l}/${r}`;
}

export function getContextWebUrl(): string {

    if (global.hasOwnProperty('_spPageContextInfo')) {
        return (global as any)._spPageContextInfo.webAbsoluteUrl;
    } else {
        return '';
    }
}

export function formatUrl(url: string, params: QueryParams = {}): string {

    const newParams: { [key: string]: string } = {};
    for (const key of Object.keys(params)) {
        const value: any = (params as any)[key];
        if (key === '$orderby') {
            newParams[key] = formatOrderByQueryParam(value);
        } else {
            newParams[key] = Array.isArray(value) ? value.join() : value;
        }
    }

    return `${url}?${queryString.stringify(newParams)}`;
}

function formatOrderByQueryParam($orderby: OrderByQueryParam | Array<OrderByQueryParam>): string {

    if (Array.isArray($orderby)) {
        return $orderby.map(formatOrderByQueryParam).join();
    } else {
        const result: Array<string> = [];
        result.push($orderby.orderBy);
        if ($orderby.ascending !== undefined) {
            result.push($orderby.ascending ? 'asc' : 'desc');
        }
        return result.join(' ');
    }
}
