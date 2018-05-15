import { EntityField } from './entityField';
import { EntityFieldInfo } from './entityFieldInfo';

export class EntityExpandField extends EntityField {

    public readonly expandFields: Array<EntityField>;

    public constructor(name: string, fieldInfo: EntityFieldInfo, expandFields: Array<EntityField>) {
        super(name, fieldInfo);

        this.expandFields = expandFields;
    }
}
