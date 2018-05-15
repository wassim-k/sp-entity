import chalk from 'chalk';
import fs from 'fs';
import { IAuthContext } from 'node-sp-auth-config';
import path from 'path';
import { Config, EntityConfig } from './config';
import { readonlyComment } from './constants';
import { EntityCodeBuilder } from './entityCodeBuilder';
import { EntityField, EntityFieldsFactory, EntityFieldsMapping } from './entityFields';
import { generateEntity } from './generateEntity';
import { Auth, SpRestClient } from './sp';
import { ConstructorParam, TsClassBuilder } from './typescriptBuilder';
import { FsUtil, requireConst, TextUtil } from './utility';

export async function generate(configPath: string): Promise<void> {

    if (!fs.existsSync(configPath) || !fs.lstatSync(configPath).isFile()) {
        throw new Error(`Config was not foud at ${chalk.yellow(configPath)}`);
    }

    const authContext: IAuthContext = await Auth.getAuthContext();
    if (authContext === undefined) { return; }
    console.log('\nConnecting to', chalk.green(authContext.siteUrl));
    const spClient: SpRestClient = await SpRestClient.create(authContext);

    const dataContextFolder: string = path.dirname(configPath);
    const config: Config = require(configPath);

    // entities
    const codeBuilders: Array<EntityCodeBuilder> = await buildEntities(config.entities, dataContextFolder, spClient);
    for (const codeBuilder of codeBuilders) {
        generateEntity(codeBuilder, dataContextFolder);
    }

    // data context
    const className: string = TextUtil.titleCase(path.basename(dataContextFolder));
    const fileName: string = TextUtil.camelCase(className);
    const dataContextBuilder: TsClassBuilder = buildDataContextClass(className, codeBuilders, config.odataVerbose);
    FsUtil.createFile(dataContextFolder, `${fileName}.ts`, dataContextBuilder.toString());
}

async function buildEntities(entities: Array<EntityConfig>, dataContextFolder: string, spClient: SpRestClient): Promise<Array<EntityCodeBuilder>> {

    const entityFieldsFactory: EntityFieldsFactory = new EntityFieldsFactory(spClient);

    const codeBuilders: Array<EntityCodeBuilder> = [];
    for (const entityConfig of entities) {

        const { listName } = entityConfig;
        try {
            console.log(`List: ${chalk.cyan(listName)}`);
            const entityName: string = TextUtil.titleCase(entityConfig.entityName);
            const entityFileName: string = TextUtil.camelCase(entityConfig.entityName);
            const mappingPath: string = path.resolve(dataContextFolder, entityFileName, `${entityFileName}Fields.ts`);
            const fieldsMapping: EntityFieldsMapping | undefined = fs.existsSync(mappingPath) ? requireConst(mappingPath) : undefined;
            const entityFields: Array<EntityField> = await entityFieldsFactory.create(listName, fieldsMapping);
            codeBuilders.push(new EntityCodeBuilder(listName, entityName, entityFields));
        } catch (error) {
            console.error(`${chalk.redBright('Failed to retrieve list:')} ${chalk.yellow(listName)}`);
            if (error.message) {
                console.error(chalk.redBright(error.message.toString()));
            }
        }
    }

    return codeBuilders;
}

function buildDataContextClass(className: string, codeBuilders: Array<EntityCodeBuilder>, odataVerbose: boolean): TsClassBuilder {

    const dataContextBuilder: TsClassBuilder = new TsClassBuilder(className);
    dataContextBuilder.setOverviewComment(readonlyComment);

    if (odataVerbose) {
        dataContextBuilder.addImport({ entries: ['setup'], from: '@sp-entity/entity' });
        dataContextBuilder.addStatement(`setup({ headers: { 'accept': 'application/json;odata=verbose' } }); // config.odataVerbose = true`);
    }

    const webUrlParam: ConstructorParam = { name: 'webUrl', type: 'string', optional: true };
    dataContextBuilder.addConstructorParam(webUrlParam);

    for (const codeBuilder of codeBuilders) {

        const { entityName, entityFileName, fieldsInterfaceBuilder, fieldsConstBuilder, itemInterfaceBuilder, listNameConst } = codeBuilder;

        dataContextBuilder.addImport({ entries: ['SpEntity'], from: '@sp-entity/entity' });
        dataContextBuilder.addImport({ entries: [listNameConst, fieldsInterfaceBuilder.name, fieldsConstBuilder.name, itemInterfaceBuilder.name], from: `./${entityFileName}` });

        dataContextBuilder.addClassField({
            modifier: 'public',
            name: TextUtil.camelCase(entityName),
            type: `SpEntity<${fieldsInterfaceBuilder.name}, ${itemInterfaceBuilder.name}>`,
            value: `new SpEntity(${listNameConst}, ${fieldsConstBuilder.name}, ${webUrlParam.name})`
        });
    }

    return dataContextBuilder;
}
