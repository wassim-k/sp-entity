import { iso8601Date } from '@sp-entity/list';
import { expect } from 'chai';
import { EntityMapper } from '../../src/mapper';

interface ListFields {

    multiChoice: string;
    created: string;
    createdBy: { $name: string, department: string, id: string, title: string };
    createdById: string;
    id: string;
    modified: string;
    multiLookup: { $name: string, lookupId: string, lookupField: string };
    multiLookupId: string;
    testLookup: { $name: string, id: string, results: string };
    title: string;
}

const listFields: ListFields = {

    multiChoice: 'MultiChoice',
    created: 'Created',
    createdBy: { $name: 'Author', id: 'Author/Id', title: 'Title', department: 'Department' },
    createdById: 'AuthorId',
    id: 'Id',
    modified: 'Modified',
    multiLookup: { $name: 'multiLookup', lookupId: 'Id', lookupField: 'LookupField' },
    multiLookupId: 'multiLookupId',
    testLookup: { $name: 'TestLookup', id: 'Id', results: 'results' },
    title: 'Title'
};

interface ListItem {

    multiChoice: Array<string>;
    readonly created: iso8601Date;
    readonly createdBy: { department: string, id: number, title: string };
    readonly createdById: number;
    readonly id: number;
    readonly multiLookup: Array<{ lookupId: number, lookupField: string }>;
    multiLookupId: Array<number>;
    readonly modified: iso8601Date;
    readonly testLookup: { id: number, results: string };
    title: string;
}

describe('EntityMapper', () => {

    const mapper: EntityMapper<ListFields, ListItem> = new EntityMapper(listFields);

    describe('constructor', () => {

        it('should prefix expand fields with internal name', () => {
            const { createdBy } = mapper.fields;
            expect(createdBy.title).to.equal(`${createdBy.$name}/Title`);
        });

        it('should not prefix expand fields internal name if already prefixed', () => {
            const { createdBy } = mapper.fields;
            expect(createdBy.id).to.equal(`${createdBy.$name}/Id`);
        });

        it('should create default $select of all non-lookup fields', () => {

            const { multiChoice, created, createdById, id, modified, multiLookupId, title } = listFields;
            const defaultSelect: Array<string> = [multiChoice, created, createdById, id, modified, multiLookupId, title];

            expect(mapper.$select).to.deep.equal(defaultSelect);
        });
    });

    describe('mapItem', () => {

        it('should map values', () => {

            const item: ListItem = mapper.mapItem({
                [listFields.id]: 1,
                [listFields.title]: 'value',
                [listFields.multiChoice]: ['A', 'B'],
                [listFields.createdById]: undefined
            });

            const mappedItem: Partial<ListItem> = {
                id: 1,
                title: 'value',
                multiChoice: ['A', 'B'],
                createdById: undefined
            };

            expect(item).to.deep.equal(mappedItem);
        });

        it('should map verbose odata collection', () => {

            const item: ListItem = mapper.mapItem({
                [listFields.id]: 1,
                [listFields.multiChoice]: {
                    results: ['A', 'B']
                }
            });

            const mappedItem: Partial<ListItem> = {
                id: 1,
                multiChoice: ['A', 'B']
            };

            expect(item).to.deep.equal(mappedItem);
        });

        it('should map lookup fields', () => {

            const item: ListItem = mapper.mapItem({
                [listFields.id]: 1,
                [listFields.createdBy.$name]: { Id: 10, Title: 'created by title', Department: 'dept' },
                [listFields.testLookup.$name]: { Id: 20, results: 'results value' }
            });

            const mappedItem: Partial<ListItem> = {
                id: 1,
                createdBy: { id: 10, title: 'created by title', department: 'dept' },
                testLookup: { id: 20, results: 'results value' }
            };

            expect(item).to.deep.equal(mappedItem);
        });

        it('should map multi lookup fields', () => {

            const item: ListItem = mapper.mapItem({
                [listFields.id]: 1,
                [listFields.multiLookup.$name]: [
                    { Id: 10, LookupField: 'value' },
                    { Id: 11, LookupField: 'value 2' }
                ]
            });

            const result: Partial<ListItem> = {
                id: 1,
                multiLookup: [
                    { lookupId: 10, lookupField: 'value' },
                    { lookupId: 11, lookupField: 'value 2' }
                ]
            };

            expect(item).to.deep.equal(result);
        });

        it('should map multi lookup fields (verbose)', () => {

            const item: ListItem = mapper.mapItem({
                [listFields.id]: 1,
                [listFields.multiLookup.$name]: {
                    results: [
                        { Id: 10, LookupField: 'value' },
                        { Id: 11, LookupField: 'value 2' }
                    ]
                }
            });

            const result: Partial<ListItem> = {
                id: 1,
                multiLookup: [
                    { lookupId: 10, lookupField: 'value' },
                    { lookupId: 11, lookupField: 'value 2' }
                ]
            };

            expect(item).to.deep.equal(result);
        });
    });

    describe('mapUpdates', () => {

        it('should map internal name => value', () => {

            const updates: { [key: string]: any } = mapper.mapUpdates({
                createdById: 1,
                title: 'value'
            });

            expect(updates).to.deep.equal({
                [listFields.createdById]: 1,
                [listFields.title]: 'value'
            });
        });

        it('should map array value to verbose odata collection', () => {

            const updates: { [key: string]: any } = mapper.mapUpdates({
                id: 1,
                multiChoice: ['A', 'B', 'C']
            });

            expect(updates).to.deep.equal({
                [listFields.id]: 1,
                [listFields.multiChoice]: {
                    results: ['A', 'B', 'C']
                }
            });
        });

        it('should throw if property is not a known field mapping', () => {

            const item: any = {
                id: 1,
                Rogue: 1
            };
            expect(() => mapper.mapUpdates(item)).to.throw();
        });
    });
});
