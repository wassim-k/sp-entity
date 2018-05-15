import { ContextInfo, List, Site, sp, Web } from '@pnp/sp';
import chalk from 'chalk';
import { isGuid } from 'is-guid';
import { IAuthContext } from 'node-sp-auth-config';
import NodeFetchClient from 'pnp-auth/lib/NodeFetchClient';
import { ODataField, odataFieldSelect, ODataList } from './odata';
import { SpFieldFactory } from './spField';
import { SpList } from './spList';

export class SpRestClient {

    public readonly spVer: number;

    private readonly cache: { [key: string]: SpList | undefined } = {};
    private readonly spWeb: Web;

    private constructor(authContext: IAuthContext, spVer: number = 16) {

        this.spWeb = new Web(authContext.siteUrl);
        this.spVer = spVer;
    }

    public async getLists(): Promise<Array<ODataList>> {
        return this.spWeb.lists.select('Title').filter('Hidden ne true').get();
    }

    public async getList(listName: string): Promise<SpList> {

        const cached: SpList | undefined = this.cache[listName];
        if (cached !== undefined) {
            return Promise.resolve(cached);
        }

        const list: List = isGuid(listName) ? this.spWeb.lists.getById(listName) : this.spWeb.lists.getByTitle(listName);

        const [odataList, odataFields] = await Promise.all([
            list.select('Id,Title').get(),
            list.fields.select(...odataFieldSelect).get()
        ]);

        return this.cache[odataList.Id] = this.cache[`{${odataList.Id}}`] = this.cache[odataList.Title] = {
            name: odataList.Title,
            fields: odataFields.map((field: ODataField) => SpFieldFactory.create(field))
        };
    }

    public static async create(authContext: IAuthContext): Promise<SpRestClient> {

        try {
            
            sp.setup({
                sp: {
                    fetchClientFactory: () => new NodeFetchClient(authContext.authOptions),
                    headers: { accept: 'application/json;odata=verbose' }
                }
            });

            const spSite: Site = new Site(authContext.siteUrl);
            const contextInfo: ContextInfo = await spSite.getContextInfo();
            const spVer: number = +(contextInfo.LibraryVersion as string).split('.')[0];
            return new SpRestClient(authContext, spVer);
        } catch (error) {
            if (error.message && error.message.includes(`'electron' is not recognized`)) {
                throw new Error(`In order to use on-demand auth, you must install electron globally by running ${chalk.yellow('npm install electron -g')}`);
            }
            throw error;
        }
    }
}
