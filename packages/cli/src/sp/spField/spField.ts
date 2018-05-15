import { ODataField } from '../odata';

export class SpField {

    private static readonly includedHiddenFields: Array<string> = [
        'GUID',
        'ContentTypeId'
    ];

    private static readonly supportedProjectableFieldTypes: Array<string> = [
        'ContentTypeId',
        'Text',
        'Number',
        'Integer',
        'DateTime',
        'Guid',
        'Counter',
        'Currency'
    ];

    public readonly allowMultipleValues: boolean;
    public readonly hidden: boolean;
    public readonly id: string;
    public readonly internalName: string;
    public readonly outputType: number;
    public readonly readOnlyField: boolean;
    public readonly title: string;
    public readonly typeAsString: string;

    public constructor(field: ODataField) {

        this.allowMultipleValues = field.AllowMultipleValues;
        this.hidden = field.Hidden;
        this.id = field.Id;
        this.internalName = field.InternalName;
        this.outputType = field.OutputType;
        this.readOnlyField = field.ReadOnlyField;
        this.title = field.Title;
        this.typeAsString = field.TypeAsString;
    }

    public get isProjectableField(): boolean {

        return SpField.supportedProjectableFieldTypes.indexOf(this.typeAsString) !== -1 ||
            this.typeAsString === 'Calculated' && this.outputType === 2; // Text
    }

    public get isExcludedHiddenField(): boolean {

        return this.hidden && SpField.includedHiddenFields.indexOf(this.internalName) === -1;
    }

    public get isIncludedByDefault(): boolean {

        return this.typeAsString !== 'Computed' && !this.isExcludedHiddenField;
    }
}
