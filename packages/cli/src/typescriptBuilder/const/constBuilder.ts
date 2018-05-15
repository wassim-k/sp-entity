import { TsBaseBuilder } from '../baseBuilder';
import { ConstAssignment } from './constAssignment';

export class TsConstBuilder extends TsBaseBuilder {

    public readonly name: string;
    public readonly type: string;

    private readonly assignments: Array<ConstAssignment>;

    public constructor(name: string, type: string) {
        super('const');

        this.name = name;
        this.type = type;
        this.assignments = [];
    }

    public addAssignment(assignment: ConstAssignment): TsConstBuilder {
        this.assignments.push(assignment);
        return this;
    }

    protected get data(): object {

        const { name, type, assignments } = this;
        return { ...super.data, name, type, assignments };
    }
}
