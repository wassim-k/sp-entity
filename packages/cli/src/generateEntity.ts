import { EntityCodeBuilder } from './entityCodeBuilder';
import { TsBaseBuilder } from './typescriptBuilder';
import { FsUtil } from './utility';

export function generateEntity(codeBuilder: EntityCodeBuilder, dataContextFolder: string): void {

    const { entityFileName, fieldsInterfaceBuilder, fieldsConstBuilder, itemInterfaceBuilder, indexBuilder } = codeBuilder;
    const folderPath: string = FsUtil.ensureFolder(dataContextFolder, entityFileName);

    // interface
    const fieldsInterfaceFileName: string = `${entityFileName}Fields.interface`;
    FsUtil.createFile(folderPath, `${fieldsInterfaceFileName}.ts`, fieldsInterfaceBuilder.toString());

    // mapping
    const fieldsConstFileName: string = `${entityFileName}Fields`;
    fieldsConstBuilder.addImport({ entries: [fieldsInterfaceBuilder.name], from: `./${fieldsInterfaceFileName}` });
    FsUtil.createFile(folderPath, `${fieldsConstFileName}.ts`, fieldsConstBuilder.toString(), false);

    // item
    const itemInterfaceFileName: string = `${entityFileName}Item`;
    FsUtil.createFile(folderPath, `${itemInterfaceFileName}.ts`, itemInterfaceBuilder.toString());

    // index
    indexBuilder.addExport({ entries: [fieldsInterfaceBuilder.name], from: `./${fieldsInterfaceFileName}` });
    indexBuilder.addExport({ entries: [fieldsConstBuilder.name], from: `./${fieldsConstFileName}` });
    indexBuilder.addExport({ entries: [itemInterfaceBuilder.name], from: `./${itemInterfaceFileName}` });

    FsUtil.createFile(folderPath, 'index.ts', indexBuilder.toString());
}
