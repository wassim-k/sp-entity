export const odataFieldSelect: Array<keyof ODataField> = [
    'AllowMultipleValues', 'Hidden', 'Id', 'InternalName', 'LookupList',
    'OutputType', 'PrimaryFieldId', 'ReadOnlyField', 'Title', 'TypeAsString'
];

export interface ODataField {

    AllowMultipleValues: boolean;
    Hidden: boolean;
    Id: string;
    InternalName: string;
    LookupList: string;
    OutputType: number;
    PrimaryFieldId: string;
    ReadOnlyField: boolean;
    Title: string;
    TypeAsString: string;
}

export interface ODataList {
    Id: string;
    Title: string;
}
