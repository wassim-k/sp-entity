import { TsBaseBuilder } from '../baseBuilder';
import { InterfaceField } from './interfaceField';

export class TsInterfaceBuilder extends TsBaseBuilder {

    public readonly name: string;
    public readonly extend: string | undefined;

    private readonly fields: Array<InterfaceField>;

    public constructor(name: string, extend?: string) {
        super('interface');

        this.name = name;
        this.extend = extend;
        this.fields = [];
    }

    public addField(field: InterfaceField): TsInterfaceBuilder {
        this.fields.push(field);
        return this;
    }

    protected get data(): object {
        const { name, extend, fields } = this;
        return { ...super.data, name, extend, fields };
    }
}
