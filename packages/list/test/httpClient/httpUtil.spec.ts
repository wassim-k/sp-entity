import { expect } from 'chai';
import { combineUrl, formatUrl } from '../../src/httpClient/httpUtil';
import { OrderByQueryParam } from '../../src/odata';

describe('httpUtil', () => {

    describe('combineUrl', () => {

        [
            ['https://contoso.sharepoint.com', 'path', 'https://contoso.sharepoint.com/path'],
            ['https://contoso.sharepoint.com/', 'path', 'https://contoso.sharepoint.com/path'],
            ['https://contoso.sharepoint.com', '/path', 'https://contoso.sharepoint.com/path'],
            ['https://contoso.sharepoint.com/', '/path', 'https://contoso.sharepoint.com/path'],
            ['https://contoso.sharepoint.com', '', 'https://contoso.sharepoint.com'],
            ['', 'path', 'path'],
            ['https://contoso.sharepoint.com', undefined, 'https://contoso.sharepoint.com'],
            [undefined, 'path', 'path'],
            [undefined, undefined, undefined]
        ].forEach((test: [string, string, string], i: number) => {

            it(`should combine url (${i + 1})`, () => {
                const [left, right, expected] = test;
                const result: string = combineUrl(left, right);
                expect(result).to.equal(expected);
            });
        });
    });

    describe('formatUrl', () => {

        const siteUrl: string = 'https://contoso.sharepoint.com';

        it('should format url and parameters', () => {
            const result: string = formatUrl(siteUrl, {
                $select: ['Field', 'Expand/Field'],
                $expand: ['Expand']
            });
            expect(result).to.equal(`${siteUrl}?%24expand=Expand&%24select=Field%2CExpand%2FField`);
        });

        describe('$orderby', () => {

            it('should format single value', () => {
                const result: string = formatUrl(siteUrl, {
                    $orderby: { orderBy: 'Field' } as OrderByQueryParam
                });
                expect(result).to.equal(`${siteUrl}?%24orderby=Field`);
            });

            it('should format single value with ascending set to true', () => {
                const result: string = formatUrl(siteUrl, {
                    $orderby: { orderBy: 'Field', ascending: true } as OrderByQueryParam
                });
                expect(result).to.equal(`${siteUrl}?%24orderby=Field%20asc`);
            });

            it('should format single value with ascending set to false', () => {
                const result: string = formatUrl(siteUrl, {
                    $orderby: { orderBy: 'Field', ascending: false } as OrderByQueryParam
                });
                expect(result).to.equal(`${siteUrl}?%24orderby=Field%20desc`);
            });

            it('should format array', () => {
                const result: string = formatUrl(siteUrl, {
                    $orderby: [
                        { orderBy: 'Field1', ascending: true },
                        { orderBy: 'Field2', ascending: false }
                    ]
                });
                expect(result).to.equal(`${siteUrl}?%24orderby=Field1%20asc%2CField2%20desc`);
            });
        });
    });
});
