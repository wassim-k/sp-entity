import { TsBaseBuilder } from '../baseBuilder';
import { ClassField } from './classField';
import { ConstructorParam } from './constructorParam';

export class TsClassBuilder extends TsBaseBuilder {

    public readonly constructorParams: Array<ConstructorParam>;
    public readonly name: string;

    private readonly fields: Array<ClassField>;

    public constructor(name: string) {
        super('class');

        this.name = name;
        this.fields = [];
        this.constructorParams = [];
    }

    public addClassField(classField: ClassField): TsClassBuilder {

        this.fields.push(classField);
        return this;
    }

    public addConstructorParam(param: ConstructorParam): TsClassBuilder {

        this.constructorParams.push(param);
        return this;
    }

    protected get data(): object {
        const { constructorParams, fields, name } = this;
        return { ...super.data, constructorParams, fields, name };
    }
}
