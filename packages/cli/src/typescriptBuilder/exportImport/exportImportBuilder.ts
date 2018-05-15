import { sortCaseInsensitive, sortPaths } from '../../utility';
import { ExportImportStatement } from './exportImportStatement';

export class ExportImportBuilder {

    private readonly statements: { [from: string]: Set<string> } = {};
    private readonly verb: string;

    public constructor(verb: 'export' | 'import') {
        this.verb = verb;
    }

    public add(statement: ExportImportStatement): void {

        if (this.statements[statement.from] === undefined) { this.statements[statement.from] = new Set(); }
        statement.entries.forEach((entry: string) => this.statements[statement.from].add(entry));
    }

    public get data(): object {

        const { verb } = this;
        const statements: Array<ExportImportStatement> = this.getSorted();
        return { statements, verb };
    }

    private getSorted(): Array<ExportImportStatement> {

        return Object.keys(this.statements).sort(sortPaths).map((from: string) => {
            const entries: Array<string> = [...this.statements[from]].sort(sortCaseInsensitive);
            return { from, entries };
        });
    }
}
