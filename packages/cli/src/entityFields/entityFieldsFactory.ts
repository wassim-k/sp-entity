import chalk from 'chalk';
import { SpField, SpFieldLookup, SpList, SpRestClient } from '../sp';
import { TextUtil, Unique, unique } from '../utility';
import { EntityExpandField } from './entityExpandField';
import { EntityField } from './entityField';
import { EntityFieldInfo, EntityFieldInfoFactory, listItemPropsInfo } from './entityFieldInfo';
import { EntityExpandFieldMapping, EntityFieldsMapping } from './entityFieldsMapping';

export class EntityFieldsFactory {

    private readonly spRestClient: SpRestClient;

    public constructor(spRestClient: SpRestClient) {

        this.spRestClient = spRestClient;
    }

    public async create(listName: string, fieldsMapping?: EntityFieldsMapping): Promise<Array<EntityField>> {

        const spList: SpList = await this.spRestClient.getList(listName);
        const mapping: EntityFieldsMapping = fieldsMapping !== undefined ? fieldsMapping : this.createDefaultFieldsMapping(spList.fields);
        const entityFields: Array<EntityField> = await this.parse(spList, mapping);
        return entityFields.sort((a: EntityField, b: EntityField) => a.propName.localeCompare(b.propName));
    }

    private async parse(spList: SpList, fieldsMapping: EntityFieldsMapping): Promise<Array<EntityField>> {

        const spFields: Array<SpField> = spList.fields;
        const entityFields: Array<EntityField> = [];

        for (const propName of Object.keys(fieldsMapping)) {

            const value: string | EntityExpandFieldMapping = fieldsMapping[propName];

            if (typeof (value) === 'string') {

                const listItemProperty: EntityFieldInfo | undefined = listItemPropsInfo.find((itemProp: EntityFieldInfo) => itemProp.internalName === value);

                if (listItemProperty !== undefined) {
                    entityFields.push(new EntityField(propName, listItemProperty));
                    continue;
                }

                let internalName: string = this.getInternalName(value);

                const spField: SpField | undefined = spFields.find((field: SpField) => {
                    return internalName === field.internalName || internalName === `${field.internalName}Id`;
                });

                if (spField === undefined) {
                    console.warn(`Field ${chalk.yellow(value)} was not found in list ${chalk.yellow(spList.name)}`);
                    continue;
                }

                if (spField instanceof SpFieldLookup && spField.isDependentLookup) {

                    const primaryField: SpField | undefined = spFields.find((field: SpField) => {
                        return field.id === spField.primaryFieldId;
                    });

                    if (primaryField === undefined) {
                        console.warn(`Skipping field ${chalk.yellow(value)} as it is not a valid dependent lookup`);
                    } else {
                        console.warn(`Skipping field ${chalk.yellow(value)}, expand lookup field ${chalk.yellow(primaryField.internalName)} instead`);
                    }

                    continue;
                }

                const fieldInfo: EntityFieldInfo = EntityFieldInfoFactory.create(spField);
                internalName = spField instanceof SpFieldLookup ? `${fieldInfo.internalName}Id` : fieldInfo.internalName;
                entityFields.push(new EntityField(propName, { ...fieldInfo, internalName }));

            } else { // expand field

                const spField: SpField | undefined = spFields.find((field: SpField) => {
                    return value.$name === field.internalName;
                });

                if (spField === undefined) {
                    console.warn(`Field ${chalk.yellow(value.$name)} was not found in list ${chalk.yellow(spList.name)}`);
                    continue;
                }

                if (!(spField instanceof SpFieldLookup)) {
                    console.warn(`Field ${chalk.yellow(value.$name)} in list ${chalk.yellow(spList.name)} is not a lookup and cannot be expanded`);
                    continue;
                }

                try {
                    const spListLookup: SpList = await this.spRestClient.getList(spField.lookupList);
                    const expandFields: Array<EntityField> = this.parseExpandField(spListLookup, value);
                    const fieldInfo: EntityFieldInfo = EntityFieldInfoFactory.create(spField);
                    entityFields.push(new EntityExpandField(propName, fieldInfo, expandFields));
                } catch (error) {
                    console.warn(`${chalk.redBright('Failed to get lookup list:')} ${chalk.yellow(spField.lookupList)}`);
                }
            }
        }

        return entityFields;
    }

    private parseExpandField(spList: SpList, expandFieldMapping: EntityExpandFieldMapping): Array<EntityField> {

        const spFields: Array<SpField> = spList.fields;
        const entityFields: Array<EntityField> = [];
        const { $name, ...mapping } = expandFieldMapping;

        for (const propName of Object.keys(mapping)) {

            const odataFieldName: string = mapping[propName];
            const internalName: string = this.getInternalName(odataFieldName);

            const spField: SpField | undefined = spFields.find((field: SpField) => {
                return internalName === field.internalName;
            });

            if (spField === undefined) {
                console.warn(`Field ${chalk.yellow(odataFieldName)} was not found in lookup list ${chalk.yellow(spList.name)}`);
                continue;
            }

            if (!spField.isProjectableField) {
                console.warn(`${chalk.yellow(`${$name}/${internalName}`)} with type ${chalk.yellow(spField.typeAsString)} is not a valid expand field`);
                continue;
            }

            const fieldInfo: EntityFieldInfo = EntityFieldInfoFactory.create(spField);
            entityFields.push(new EntityField(propName, fieldInfo));
        }

        return entityFields.sort((a: EntityField, b: EntityField) => a.propName.localeCompare(b.propName));
    }

    private createDefaultFieldsMapping(spFields: Array<SpField>): EntityFieldsMapping {

        const uniquePropName: Unique = unique();

        const defaultFields: Array<SpField> = spFields.filter((spField: SpField) => spField.isIncludedByDefault);

        return defaultFields.reduce((fieldsMapping: EntityFieldsMapping, spField: SpField) => {

            const propName: string = uniquePropName(TextUtil.camelCase(spField.title));

            if (spField instanceof SpFieldLookup) {

                if (spField.isExpandable) {
                    fieldsMapping[propName] = { $name: spField.internalName, id: 'Id', title: 'Title' };
                }

                fieldsMapping[`${propName}Id`] = `${spField.internalName}Id`;
            } else {
                fieldsMapping[propName] = spField.internalName;
            }

            return fieldsMapping;
        }, { fileSystemObjectType: 'FileSystemObjectType' });
    }

    private getInternalName(odataFieldName: string): string {

        if (odataFieldName.includes('/')) { odataFieldName = odataFieldName.split('/')[1]; }
        if (odataFieldName === 'Id') { odataFieldName = 'ID'; }
        if (odataFieldName.startsWith('OData_')) { odataFieldName = odataFieldName.substring('OData_'.length); }

        return odataFieldName;
    }
}
