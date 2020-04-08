export interface OrderByQueryParam {
    orderBy: string;
    ascending?: boolean;
}

export interface GetItemQueryParams {

    $expand?: string | Array<string>;
    $select?: string | Array<string>;
}

export interface QueryParams {
    $filter?: string;
    $expand?: string | Array<string>;
    $orderby?: OrderByQueryParam | Array<OrderByQueryParam>;
    $select?: string | Array<string>;
    $skip?: number;
    $skiptoken?: string;
    $top?: number;
}
