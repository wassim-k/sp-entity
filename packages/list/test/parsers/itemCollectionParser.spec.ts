import { expect } from 'chai';
import { ItemCollection } from '../../src/itemCollection';
import { QueryParams } from '../../src/odata';
import { parseItemCollection } from '../../src/parsers';

describe('ItemCollectionParser', () => {

    const params: QueryParams = { $top: 1 };

    it('should parse verbose response', async () => {

        const json: any = { d: { results: ['item'], __next: 'https://contoso.sharepoint.com?$skiptoken=token' } };
        const parsed: ItemCollection<any> = await parseItemCollection(json, params);
        const expected: ItemCollection<any> = { items: ['item'], next: { $top: 1, $skiptoken: 'token' } };
        expect(parsed).to.deep.equal(expected);
    });

    it('should parse non-verbose response', async () => {

        const json: any = { 'value': ['item'], 'odata.nextLink': 'https://contoso.sharepoint.com?$skiptoken=token' };
        const parsed: ItemCollection<any> = await parseItemCollection(json, params);
        const expected: ItemCollection<any> = { items: ['item'], next: { $top: 1, $skiptoken: 'token' } };
        expect(parsed).to.deep.equal(expected);
    });
});
