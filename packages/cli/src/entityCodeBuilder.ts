import { editComment, readonlyCommentWithEdit } from './constants';
import { EntityExpandField, EntityField } from './entityFields';
import { TsBaseBuilder, TsConstBuilder, TsInterfaceBuilder } from './typescriptBuilder';
import { TextUtil } from './utility';

export class EntityCodeBuilder {

    public readonly fieldsInterfaceBuilder: TsInterfaceBuilder;
    public readonly fieldsConstBuilder: TsConstBuilder;
    public readonly itemInterfaceBuilder: TsInterfaceBuilder;
    public readonly indexBuilder: TsBaseBuilder;

    public readonly entityName: string;
    public readonly entityFileName: string;
    public readonly listNameConst: string;

    public constructor(listName: string, entityName: string, fields: Array<EntityField>) {

        this.entityName = entityName;
        this.entityFileName = TextUtil.camelCase(entityName);

        this.fieldsInterfaceBuilder = new TsInterfaceBuilder(`${entityName}Fields`);
        this.fieldsConstBuilder = new TsConstBuilder(`${this.entityFileName}Fields`, this.fieldsInterfaceBuilder.name);
        this.itemInterfaceBuilder = new TsInterfaceBuilder(`${entityName}Item`);

        // Add overview comments
        const comment: string = readonlyCommentWithEdit.replace('[FILENAME]', `${this.entityFileName}Fields.ts`);
        this.fieldsInterfaceBuilder.setOverviewComment(comment);
        this.fieldsConstBuilder.setOverviewComment(editComment);
        this.itemInterfaceBuilder.setOverviewComment(comment);

        // Index
        this.indexBuilder = new TsBaseBuilder('');
        this.listNameConst = `${this.entityFileName}ListName`;
        this.indexBuilder.setOverviewComment('// tslint:disable');
        this.indexBuilder.addStatement(`export const ${this.listNameConst}: string = '${listName}';`);

        this.build(fields);
    }

    private build(fields: Array<EntityField>): void {

        for (const field of fields) {

            this.itemInterfaceBuilder.addImport({ entries: field.imports, from: '@sp-entity/entity' });

            if (field instanceof EntityExpandField) {
                this.buildEntityExpandField(field);
            } else {
                this.buildEntityField(field);
            }
        }
    }

    private buildEntityField(prop: EntityField): void {

        const { enumerable, propName, propType, readonly } = prop;
        this.fieldsInterfaceBuilder.addField({ name: propName, type: 'string' });
        this.fieldsConstBuilder.addAssignment({ name: propName, value: `'${prop.internalName}'` });
        this.itemInterfaceBuilder.addField({ name: propName, type: enumerable ? `Array<${propType}>` : propType, readonly });
    }

    private buildEntityExpandField(prop: EntityExpandField): void {

        const { enumerable, expandFields, internalName, propName } = prop;

        const fieldTypes: Array<string> = [];
        const fieldMappings: Array<string> = [];
        const itemTypes: Array<string> = [];

        expandFields.forEach((f: EntityField) => {
            fieldTypes.push(`${f.propName}: string`);
            fieldMappings.push(`${f.propName}: '${f.internalName}'`);
            itemTypes.push(`${f.propName}: ${f.propType}`);
        });

        const itemType: string = `{ ${itemTypes.join(', ')} }`;
        this.fieldsInterfaceBuilder.addField({ name: propName, type: `{ $name: string, ${fieldTypes.join(', ')} }` });
        this.fieldsConstBuilder.addAssignment({ name: propName, value: `{ $name: '${internalName}', ${fieldMappings.join(', ')} }` });
        this.itemInterfaceBuilder.addField({ name: propName, type: enumerable ? `Array<${itemType}>` : itemType, readonly: true });
    }
}
