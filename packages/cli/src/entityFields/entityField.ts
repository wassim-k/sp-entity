import { EntityFieldInfo } from './entityFieldInfo';

export class EntityField {

    public readonly enumerable: boolean;
    public readonly imports: Array<string>;
    public readonly internalName: string;
    public readonly propName: string;
    public readonly propType: string;
    public readonly readonly: boolean;

    public constructor(name: string, fieldInfo: EntityFieldInfo) {

        this.enumerable = fieldInfo.enumerable;
        this.imports = fieldInfo.imports;
        this.internalName = fieldInfo.internalName;
        this.propName = name;
        this.propType = fieldInfo.type;
        this.readonly = fieldInfo.readonly;
    }
}
