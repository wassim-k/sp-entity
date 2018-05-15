import { SpField, SpFieldLookup } from '../../sp';
import { EntityFieldInfo } from './entityFieldInfo';

export class EntityFieldInfoFactory {

    public static create(spField: SpField): EntityFieldInfo {

        let enumerable: boolean | undefined;
        let propType: string;
        let imports: Array<string> = [];

        switch (spField.typeAsString) {

            case 'Boolean':
                propType = 'boolean';
                break;
            case 'Attachments':
                propType = 'boolean';
                break;
            case 'AllDayEvent':
                propType = 'boolean';
                break;
            case 'Calculated':
                switch (spField.outputType) {
                    case 4: // DateTime
                        propType = 'iso8601Date';
                        imports = ['iso8601Date'];
                        break;
                    default:
                        propType = 'string';
                        break;
                }
                break;
            case 'Choice':
                propType = 'string';
                break;
            case 'Computed':
                propType = 'string';
                break;
            case 'ContentTypeId':
                propType = 'string';
                break;
            case 'Counter':
                propType = 'number';
                break;
            case 'CrossProjectLink':
                propType = 'boolean';
                break;
            case 'Currency':
                propType = 'number';
                break;
            case 'DateTime':
                propType = 'iso8601Date';
                imports = ['iso8601Date'];
                break;
            case 'Error':
                propType = 'object';
                break;
            case 'File':
                propType = 'string';
                break;
            case 'GridChoice':
                enumerable = true;
                propType = 'SpRatingScaleValue';
                imports = ['SpRatingScaleValue'];
                break;
            case 'Guid':
                propType = 'string';
                break;
            case 'Integer':
                propType = 'number';
                break;
            case 'User':
                propType = 'number';
                break;
            case 'Lookup':
                return EntityFieldInfoFactory.getLookupFieldInfo(spField as SpFieldLookup);
            case 'UserMulti':
            case 'LookupMulti':
                enumerable = true;
                propType = 'number';
                break;
            case 'ModStat':
                propType = 'number';
                break;
            case 'MultiChoice':
                enumerable = true;
                propType = 'string';
                break;
            case 'Note':
                propType = 'string';
                break;
            case 'Number':
                propType = 'number';
                break;
            case 'PageSeparator':
                propType = 'object';
                break;
            case 'Recurrence':
                propType = 'boolean';
                break;
            case 'Text':
                propType = 'string';
                break;
            case 'ThreadIndex':
                propType = 'object';
                break;
            case 'Threading':
                propType = 'object';
                break;
            case 'URL':
                propType = 'SpUrlValue';
                imports = ['SpUrlValue'];
                break;
            case 'WorkflowEventType':
                propType = 'string';
                break;
            case 'WorkflowStatus':
                propType = 'number';
                break;
            default:
                propType = 'any';
                break;
        }

        return EntityFieldInfoFactory.createFieldInfo(propType, imports, spField, enumerable);
    }

    private static getLookupFieldInfo(spField: SpFieldLookup): EntityFieldInfo {

        let propType: string;
        let imports: Array<string> = [];

        if (!spField.isLookupToDocs) {
            propType = 'number';
            return EntityFieldInfoFactory.createFieldInfo(propType, imports, spField);
        }

        switch (spField.internalName) {
            case 'UniqueId':
            case 'ClientId':
                propType = 'string';
                break;
            case 'Last_x0020_Modified':
            case 'Created_x0020_Date':
                propType = 'iso8601Date';
                imports = ['iso8601Date'];
                break;
            case 'FSObjType':
                propType = 'number';
                break;
            case 'FileRef':
            case 'FileDirRef':
            case 'FileLeafRef':
            case '_CheckinComment':
                propType = 'string';
                break;
            default:
                propType = 'any';
        }

        return EntityFieldInfoFactory.createFieldInfo(propType, imports, spField);
    }

    private static createFieldInfo(type: string, imports: Array<string>, spField: SpField, enumerable: boolean = false): EntityFieldInfo {

        const readonly: boolean = spField.readOnlyField;
        let internalName: string = spField.internalName;

        if (internalName === 'ID') {
            internalName = 'Id';
        } else if (internalName.startsWith('_')) {
            internalName = `OData_${internalName}`;
        }

        return { internalName, type, enumerable, imports, readonly };
    }
}
