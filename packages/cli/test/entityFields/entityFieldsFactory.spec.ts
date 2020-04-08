// tslint:disable:typedef
// tslint:disable:max-line-length

import { expect } from 'chai';
import { IAuthContext } from 'node-sp-auth-config/dist';
import * as TypeMoq from 'typemoq';
import { EntityExpandField, EntityField, EntityFieldsFactory } from '../../src/entityFields';
import { ODataField, SpField, SpFieldLookup, SpRestClient } from '../../src/sp';

describe('EntityFieldsFactory', () => {

    let spRestClientMock: TypeMoq.IMock<SpRestClient>;
    let entityFieldsFactory: EntityFieldsFactory;

    beforeEach(() => {
        const authContext: IAuthContext = { siteUrl: 'https://contoso.sharepoint.com' } as IAuthContext;
        spRestClientMock = TypeMoq.Mock.ofType(SpRestClient as any, TypeMoq.MockBehavior.Loose, true, authContext);
        entityFieldsFactory = new EntityFieldsFactory(spRestClientMock.object);
    });

    describe('createDefaultFieldsMapping', () => {

        it('should add fileSystemObjectType to default fields mapping', async () => {

            spRestClientMock
                .setup((spRestClient: SpRestClient) => spRestClient.getList(TypeMoq.It.isAnyString()))
                .returns(async (listName: string) => ({
                    List: {
                        name: 'List',
                        fields: []
                    }
                })[listName]);

            const entityFields: Array<EntityField> = await entityFieldsFactory.create('List');
            expect(entityFields.map((ef) => ef.internalName)).to.have.deep.members(['FileSystemObjectType']);
        });

        it('should map non lookup fields', async () => {
            spRestClientMock
                .setup((spRestClient: SpRestClient) => spRestClient.getList(TypeMoq.It.isAnyString()))
                .returns(async (listName: string) => ({
                    List: {
                        name: 'List',
                        fields: [
                            new SpField({ InternalName: 'FieldName', Title: 'Title', TypeAsString: 'Text' } as ODataField)
                        ]
                    }
                })[listName]);

            const entityFields: Array<EntityField> = await entityFieldsFactory.create('List');
            expect(entityFields.map((ef) => ef.internalName)).to.have.deep.members(['FieldName', 'FileSystemObjectType']);
        });

        it('should map lookup field to id and expand properties', async () => {

            const expandableLookupField: SpFieldLookup = new SpFieldLookup({ InternalName: 'FieldLookup', Title: 'Title', TypeAsString: 'Lookup', LookupList: 'LookupList' } as ODataField);

            spRestClientMock
                .setup((spRestClient: SpRestClient) => spRestClient.getList(TypeMoq.It.isAnyString()))
                .returns(async (listName: string) => ({
                    List: {
                        name: 'List',
                        fields: [
                            expandableLookupField
                        ]
                    },
                    LookupList: {
                        name: 'LookupList',
                        fields: [
                            new SpField({ InternalName: 'ID', Title: 'Id', TypeAsString: 'Counter' } as ODataField),
                            new SpField({ InternalName: 'Title', Title: 'Title', TypeAsString: 'Counter' } as ODataField)
                        ]
                    }
                })[listName]);

            const entityFields: Array<EntityField> = await entityFieldsFactory.create('List');
            expect(expandableLookupField.isExpandable).to.equal(true);
            expect(entityFields.map((ef) => ef.internalName)).to.have.deep.members(['FileSystemObjectType', 'FieldLookup', 'FieldLookupId']);
        });

        it('should handle fields with duplicate titles', async () => {

            spRestClientMock
                .setup((spRestClient: SpRestClient) => spRestClient.getList(TypeMoq.It.isAnyString()))
                .returns(async (listName: string) => ({
                    List: {
                        name: 'List',
                        fields: [
                            new SpField({ InternalName: 'FieldName', Title: 'DuplicateTitle', TypeAsString: 'Text' } as ODataField),
                            new SpField({ InternalName: 'FieldName2', Title: 'DuplicateTitle', TypeAsString: 'Text' } as ODataField),
                            new SpField({ InternalName: 'FieldName3', Title: 'DuplicateTitle', TypeAsString: 'Text' } as ODataField)
                        ]
                    }
                })[listName]);

            const entityFields: Array<EntityField> = await entityFieldsFactory.create('List');
            expect(entityFields.map((ef) => ef.propName)).to.have.deep.members(['fileSystemObjectType', 'duplicateTitle', 'duplicateTitle2', 'duplicateTitle3']);
        });
    });

    describe('parse', () => {

        const warnOriginal: any = console.warn;
        let warnMock;

        beforeEach(() => {
            warnMock = TypeMoq.Mock.ofInstance(console.warn);
            console.warn = warnMock.object;
        });

        afterEach(() => {
            console.warn = warnOriginal;
        });

        describe('scalar', () => {

            it('should parse scalar properties', async () => {
                spRestClientMock
                    .setup((spRestClient: SpRestClient) => spRestClient.getList(TypeMoq.It.isAnyString()))
                    .returns(async (listName: string) => ({
                        List: {
                            name: 'List',
                            fields: [
                                new SpField({ InternalName: 'Field', Title: 'Title', TypeAsString: 'Text' } as ODataField)
                            ]
                        }
                    })[listName]);

                expect(async () => {
                    return await entityFieldsFactory.create('List', {
                        field: 'Field'
                    });
                }).to.not.throw();
            });

            it('should map list item properties', async () => {
                spRestClientMock
                    .setup((spRestClient: SpRestClient) => spRestClient.getList(TypeMoq.It.isAnyString()))
                    .returns(async (listName: string) => ({
                        List: {
                            name: 'List',
                            fields: []
                        }
                    })[listName]);

                const entityFields: Array<EntityField> = await entityFieldsFactory.create('List', {
                    fileSystemObjectType: 'FileSystemObjectType'
                });

                expect(entityFields.map((ef) => ef.internalName))
                    .to.have.length(1)
                    .and
                    .to.deep.equal(['FileSystemObjectType']);
            });

            it('should warn if field is not found in list', async () => {

                spRestClientMock
                    .setup((spRestClient: SpRestClient) => spRestClient.getList(TypeMoq.It.isAnyString()))
                    .returns(async (listName: string) => ({
                        List: {
                            name: 'List',
                            fields: []
                        }
                    })[listName]);

                const entityFields: Array<EntityField> = await entityFieldsFactory.create('List', {
                    invalid: 'InvalidListItemPropertyOrFieldName'
                });

                warnMock.verify(
                    (warn) => warn(TypeMoq.It.is((msg) => msg.includes('was not found in list'))),
                    TypeMoq.Times.once());
            });

            it('should skip and warn about dependent lookup fields', async () => {

                const dependentLookupField: SpFieldLookup = new SpFieldLookup({
                    PrimaryFieldId: '{00000000-0000-0000-0000-000000000000}', // valid guid
                    InternalName: 'DependentLookup',
                    Title: 'Title',
                    TypeAsString: 'Lookup'
                } as ODataField);

                spRestClientMock
                    .setup((spRestClient: SpRestClient) => spRestClient.getList(TypeMoq.It.isAnyString()))
                    .returns(async (listName: string) => ({
                        List: {
                            name: 'List',
                            fields: [dependentLookupField]
                        }
                    })[listName]);

                const entityFields: Array<EntityField> = await entityFieldsFactory.create('List', {
                    dependent: dependentLookupField.internalName
                });

                expect(dependentLookupField.isDependentLookup).to.equal(true);

                warnMock.verify(
                    (warn) => warn(TypeMoq.It.is((msg) => msg.includes('is not a valid dependent lookup'))),
                    TypeMoq.Times.once());
            });
        });

        describe('expand', () => {

            it('should warn if field is not found in list', async () => {

                spRestClientMock
                    .setup((spRestClient: SpRestClient) => spRestClient.getList(TypeMoq.It.isAnyString()))
                    .returns(async (listName: string) => ({
                        List: {
                            name: 'List',
                            fields: []
                        }
                    })[listName]);

                const entityFields: Array<EntityField> = await entityFieldsFactory.create('List', {
                    invalid: { $name: 'InvalidFieldLookup' }
                });

                warnMock.verify(
                    (warn) => warn(TypeMoq.It.is((msg) => msg.includes('was not found in list'))),
                    TypeMoq.Times.once());
            });

            it('should warn if field is not a lookup', async () => {

                spRestClientMock
                    .setup((spRestClient: SpRestClient) => spRestClient.getList(TypeMoq.It.isAnyString()))
                    .returns(async (listName: string) => ({
                        List: {
                            name: 'List',
                            fields: [
                                new SpField({ InternalName: 'Field', Title: 'Title', TypeAsString: 'Text' } as ODataField)
                            ]
                        }
                    })[listName]);

                const entityFields: Array<EntityField> = await entityFieldsFactory.create('List', {
                    notLookup: { $name: 'Field' }
                });

                warnMock.verify(
                    (warn) => warn(TypeMoq.It.is((msg) => msg.includes('is not a lookup'))),
                    TypeMoq.Times.once());
            });

            it('should warn if failed to get lookup list', async () => {

                spRestClientMock
                    .setup((spRestClient: SpRestClient) => spRestClient.getList(TypeMoq.It.isAnyString()))
                    .returns(async (listName: string) => ({
                        List: {
                            name: 'List',
                            fields: [
                                new SpFieldLookup({ InternalName: 'FieldLookup', Title: 'Title', TypeAsString: 'Lookup', LookupList: 'LookupList' } as ODataField)
                            ]
                        }
                    })[listName]);

                const entityFields: Array<EntityField> = await entityFieldsFactory.create('List', {
                    notLookup: { $name: 'FieldLookup' }
                });

                warnMock.verify(
                    (warn) => warn(TypeMoq.It.is((msg) => msg.includes('Failed to get lookup list'))),
                    TypeMoq.Times.once());
            });

            it('should parse expand properties', async () => {
                spRestClientMock
                    .setup((spRestClient: SpRestClient) => spRestClient.getList(TypeMoq.It.isAnyString()))
                    .returns(async (listName: string) => ({
                        List: {
                            name: 'List',
                            fields: [
                                new SpField({ InternalName: 'Field', Title: 'Title', TypeAsString: 'Text' } as ODataField)
                            ]
                        }
                    })[listName]);

                expect(async () => {
                    return await entityFieldsFactory.create('List', {
                        field: { $name: 'Field' }
                    });
                }).to.not.throw();
            });
        });

        describe('parseExpandField', () => {

            it('should warn if expand field is not found in lookup list', async () => {

                spRestClientMock
                    .setup((spRestClient: SpRestClient) => spRestClient.getList(TypeMoq.It.isAnyString()))
                    .returns(async (listName: string) => ({
                        List: {
                            name: 'List',
                            fields: [
                                new SpFieldLookup({ InternalName: 'FieldLookup', Title: 'Title', TypeAsString: 'Lookup', LookupList: 'LookupList' } as ODataField)
                            ]
                        },
                        LookupList: {
                            name: 'LookupList',
                            fields: [
                                new SpField({ InternalName: 'ID', Title: 'Id', TypeAsString: 'Counter' } as ODataField),
                                new SpField({ InternalName: 'Title', Title: 'Title', TypeAsString: 'Counter' } as ODataField)
                            ]
                        }
                    })[listName]);

                const entityFields: Array<EntityField> = await entityFieldsFactory.create('List', {
                    expand: { $name: 'FieldLookup', id: 'InvalidField' }
                });

                warnMock.verify(
                    (warn) => warn(TypeMoq.It.is((msg) => msg.includes('was not found in lookup list'))),
                    TypeMoq.Times.once());
            });

            it('should warn if expand field is not valid', async () => {

                const invalidLookupField: SpField = new SpField({ InternalName: 'Field', Title: 'Title', TypeAsString: 'Boolean' } as ODataField);

                spRestClientMock
                    .setup((spRestClient: SpRestClient) => spRestClient.getList(TypeMoq.It.isAnyString()))
                    .returns(async (listName: string) => ({
                        List: {
                            name: 'List',
                            fields: [
                                new SpFieldLookup({ InternalName: 'FieldLookup', Title: 'Boolean', TypeAsString: 'Lookup', LookupList: 'LookupList' } as ODataField)
                            ]
                        },
                        LookupList: {
                            name: 'LookupList',
                            fields: [
                                invalidLookupField
                            ]
                        }
                    })[listName]);

                const entityFields: Array<EntityField> = await entityFieldsFactory.create('List', {
                    expand: { $name: 'FieldLookup', bool: invalidLookupField.internalName }
                });

                expect(invalidLookupField.isProjectableField).to.equal(false);

                warnMock.verify(
                    (warn) => warn(TypeMoq.It.is((msg) => msg.includes('is not a valid expand field'))),
                    TypeMoq.Times.once());
            });

            it('should parse expand field', async () => {

                spRestClientMock
                    .setup((spRestClient: SpRestClient) => spRestClient.getList(TypeMoq.It.isAnyString()))
                    .returns(async (listName: string) => ({
                        List: {
                            name: 'List',
                            fields: [
                                new SpFieldLookup({ InternalName: 'FieldLookup', Title: 'Lookup', TypeAsString: 'Lookup', LookupList: 'LookupList' } as ODataField)
                            ]
                        },
                        LookupList: {
                            name: 'LookupList',
                            fields: [
                                new SpField({ InternalName: 'ExpandField', Title: 'Expand', TypeAsString: 'Text' } as ODataField)
                            ]
                        }
                    })[listName]);

                const entityFields: Array<EntityField> = await entityFieldsFactory.create('List', {
                    expand: { $name: 'FieldLookup', expand: 'ExpandField' }
                });

                expect(entityFields).to.have.length(1);
                expect(entityFields[0]).to.be.an.instanceof(EntityExpandField);
                expect((entityFields[0] as EntityExpandField).expandFields).to.have.length(1);
                expect((entityFields[0] as EntityExpandField).expandFields[0]).to.have.property('internalName', 'ExpandField');

                warnMock.verify(
                    (warn) => warn(TypeMoq.It.isAnyString()),
                    TypeMoq.Times.never());
            });

            it('should handle fields prefixed with lookup field name', async () => {

                spRestClientMock
                    .setup((spRestClient: SpRestClient) => spRestClient.getList(TypeMoq.It.isAnyString()))
                    .returns(async (listName: string) => ({
                        List: {
                            name: 'List',
                            fields: [
                                new SpFieldLookup({ InternalName: 'LookupField', Title: 'Lookup', TypeAsString: 'Lookup', LookupList: 'LookupList' } as ODataField)
                            ]
                        },
                        LookupList: {
                            name: 'LookupList',
                            fields: [
                                new SpField({ InternalName: 'ExpandField', Title: 'Expand', TypeAsString: 'Text' } as ODataField)
                            ]
                        }
                    })[listName]);

                const entityFields: Array<EntityField> = await entityFieldsFactory.create('List', {
                    expand: { $name: 'LookupField', expand: 'LookupField/ExpandField' }
                });

                warnMock.verify(
                    (warn) => warn(TypeMoq.It.isAnyString()),
                    TypeMoq.Times.never());
            });
        });
    });
});
