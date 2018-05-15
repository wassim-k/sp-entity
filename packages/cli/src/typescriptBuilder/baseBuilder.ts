import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import { ExportImportBuilder, ExportImportStatement } from './exportImport';

export class TsBaseBuilder {

    private static readonly filename: string = path.resolve(__dirname, 'baseBuilder.ejs');
    private static _template: string;

    private comment: string | undefined;
    private readonly exports: ExportImportBuilder;
    private readonly imports: ExportImportBuilder;
    private readonly statements: Array<string>;
    private readonly templateName: string;

    public constructor(templateName: string) {
        this.templateName = templateName;

        this.exports = new ExportImportBuilder('export');
        this.imports = new ExportImportBuilder('import');
        this.statements = [];
    }

    protected get data(): object {
        return {};
    }

    public setOverviewComment(comment: string): void {
        this.comment = comment;
    }

    public addStatement(statement: string): void {
        this.statements.push(statement);
    }

    public addExport(statement: ExportImportStatement): TsBaseBuilder {
        this.exports.add(statement);
        return this;
    }

    public addImport(statement: ExportImportStatement): TsBaseBuilder {
        this.imports.add(statement);
        return this;
    }

    public toString(): string {

        const exports: object = this.exports.data;
        const imports: object = this.imports.data;
        const { templateName, statements, comment } = this;
        const { template, filename } = TsBaseBuilder;
        return ejs.render(template, { comment, exports, imports, statements, templateName, ...this.data }, { filename });
    }

    private static get template(): string {
        if (this._template === undefined) {
            this._template = fs.readFileSync(this.filename, 'utf8');
        }
        return this._template;
    }
}
