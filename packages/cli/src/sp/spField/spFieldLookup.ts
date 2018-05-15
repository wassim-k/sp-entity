import { isGuid } from 'is-guid';
import { ODataField } from '../odata';
import { SpField } from './spField';

export class SpFieldLookup extends SpField {

    private static readonly globalLookupLists: Array<string> = [
        'Lists',
        'Docs',
        'WebParts',
        'ComMd',
        'Webs',
        'Workflow',
        'WFTemp',
        'Solutions',
        'Self',
        'UserInfo',
        'AppPrincipals'
    ];

    public readonly lookupList: string;
    public readonly primaryFieldId: string | undefined;

    public constructor(field: ODataField) {
        super(field);

        this.lookupList = field.LookupList;
        this.primaryFieldId = field.PrimaryFieldId;
    }

    public get isLookupToGlobalList(): boolean {

        return SpFieldLookup.globalLookupLists.indexOf(this.lookupList) !== -1;
    }

    public get isDependentLookup(): boolean {

        return this.primaryFieldId ? isGuid(this.primaryFieldId) : false;
    }

    public get isIncludedByDefault(): boolean {
        return super.isIncludedByDefault &&
            !this.isLookupToGlobalList &&
            !this.isDependentLookup &&
            !this.isLookupToDocs;
    }

    public get isExpandable(): boolean {
        return !this.isLookupToGlobalList &&
            !this.isLookupToDocs &&
            !this.isDependentLookup &&
            !this.primaryFieldId;
    }

    public get isLookupToDocs(): boolean {

        return this.lookupList === '';
    }
}
