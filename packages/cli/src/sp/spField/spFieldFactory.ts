import { ODataField } from '../odata';
import { SpField } from './spField';
import { SpFieldLookup } from './spFieldLookup';

export class SpFieldFactory {

    public static create(field: ODataField): SpField {

        switch (field.TypeAsString) {
            case 'User':
            case 'Lookup':
            case 'UserMulti':
            case 'LookupMulti':
                return new SpFieldLookup(field);
            default:
                return new SpField(field);
        }
    }
}
