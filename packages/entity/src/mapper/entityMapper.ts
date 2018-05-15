import { EntityExpandFieldMapping, EntityFieldsMapping } from './entityFieldsMapping';

export class EntityMapper<TFields extends object, TItem extends object> {

    public readonly fields: TFields; // prop name => internal name
    public readonly $select: Array<string>;

    private readonly fieldsByInternalName: EntityFieldsMapping; // internal name => prop name

    public constructor(fields: TFields = {} as any) {

        const fieldMapping: EntityFieldsMapping = EntityMapper.prefixInternalNameToExpandFields(fields as EntityFieldsMapping);
        this.fieldsByInternalName = EntityMapper.createFieldsByInternalName(fieldMapping);
        this.$select = EntityMapper.createDefaultSelect(fieldMapping);
        this.fields = fieldMapping as TFields;
    }

    public mapItem(odataItem: object): TItem {

        return this.mapItemInternal(odataItem);
    }

    public mapItems(odataItems: Array<object>): Array<TItem> {

        return odataItems.map((odataItem: object) => this.mapItemInternal(odataItem));
    }

    public mapUpdates(item: Partial<TItem>): { [key: string]: any } {

        const mapping: EntityFieldsMapping = this.fields as EntityFieldsMapping;
        return Object.keys(item)
            .reduce((updates: { [key: string]: string | object }, propName: string) => {
                const mapped: string | EntityExpandFieldMapping | undefined = mapping[propName];
                if (typeof (mapped) === 'string') { // non-lookup
                    const propValue: any = (item as any)[propName];
                    if (Array.isArray(propValue)) { // multi-value field
                        updates[mapped] = { results: propValue }; // verbose json format
                    } else {
                        updates[mapped] = propValue;
                    }
                } else if (typeof (mapped) === 'undefined') {
                    throw new Error(`'${propName}' is not a valid update property`);
                }
                return updates;
            }, {});
    }

    private mapItemInternal(odataItem: { [key: string]: any }, mapping: EntityFieldsMapping = this.fieldsByInternalName): TItem {

        const item: { [key: string]: any } = {};
        for (const key of Object.keys(odataItem)) {
            const propName: string | EntityExpandFieldMapping | undefined = mapping[key];
            const value: any = odataItem[key];
            if (typeof (propName) === 'string') { // internal name
                if (value && value.hasOwnProperty('results')) { // verbose odata collection
                    item[propName] = value.results;
                } else {
                    item[propName] = value;
                }
            } else if (typeof (propName) === 'object') { // lookup
                if (Array.isArray(value)) { // multi-lookup (json light)
                    item[propName.$name] = value.map((lookupItem: object) => this.mapItemInternal(lookupItem, propName));
                } else if (Array.isArray(value.results)) { // multi-lookup (json verbose)
                    item[propName.$name] = value.results.map((lookupItem: object) => this.mapItemInternal(lookupItem, propName));
                } else { // lookup
                    item[propName.$name] = this.mapItemInternal(value, propName);
                }
            }
        }
        return item as TItem;
    }

    private static prefixInternalNameToExpandFields(fields: EntityFieldsMapping): EntityFieldsMapping {

        return Object
            .keys(fields)
            .reduce((newFields: EntityFieldsMapping, propName: string) => {
                const value: string | EntityExpandFieldMapping | undefined = fields[propName];
                if (typeof (value) === 'object') {
                    const { $name, ...expandFields } = value;
                    Object.keys(expandFields).forEach((expandFieldPropName: string) => {
                        if ((expandFields[expandFieldPropName] as string).indexOf('/') === -1) {
                            expandFields[expandFieldPropName] = `${$name}/${expandFields[expandFieldPropName]}`;
                        }
                    });
                    newFields[propName] = { $name, ...expandFields };
                }
                return newFields;
            }, { ...fields });
    }

    private static createFieldsByInternalName(fields: EntityFieldsMapping): EntityFieldsMapping {

        return Object
            .keys(fields)
            .reduce((mapping: EntityFieldsMapping, propName: string) => {
                const value: string | EntityExpandFieldMapping | undefined = fields[propName];
                if (typeof (value) === 'string') { // internal name
                    mapping[value] = propName;
                } else if (typeof (value) === 'object') { // expand
                    const { $name, ...expandFields } = value;
                    Object.keys(expandFields).forEach((key: string) => {
                        if ((expandFields[key] as string).indexOf('/') !== -1) {
                            expandFields[key] = (expandFields[key] as string).split('/')[1];
                        }
                    });
                    mapping[$name] = { $name: propName, ...this.createFieldsByInternalName(expandFields) };
                }
                return mapping;
            }, {});
    }

    private static createDefaultSelect(fields: EntityFieldsMapping): Array<string> {

        return Object
            .keys(fields)
            .map((propName: string) => fields[propName])
            .filter((internalName: string | EntityExpandFieldMapping | undefined): internalName is string => typeof (internalName) === 'string');
    }
}
