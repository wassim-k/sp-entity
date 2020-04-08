import { IFieldInfo } from '@pnp/sp/fields';

export const odataFieldSelect: Array<keyof ODataField> = [
    'AllowMultipleValues', 'Hidden', 'Id', 'InternalName', 'LookupList',
    'OutputType', 'PrimaryFieldId', 'ReadOnlyField', 'Title', 'TypeAsString'
];

export interface ODataField extends IFieldInfo {
    AllowMultipleValues: boolean;
    LookupList: string;
    OutputType: number;
    PrimaryFieldId: string;
}

export interface ODataList {
    Id: string;
    Title: string;
}
