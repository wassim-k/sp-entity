import { IHttpClientImpl } from '@pnp/common';
import { combineUrl } from './httpUtil';

export class RequestDigest {

    private static readonly cache: { [key: string]: RequestDigest } = {};

    private readonly value: string;
    private readonly expiration: Date;

    private constructor(value: string, expiration: Date) {
        this.value = value;
        this.expiration = expiration;
    }

    private get hasExpired(): boolean {
        const now: Date = new Date();
        return now >= this.expiration;
    }

    public static get(url: string, client: IHttpClientImpl): Promise<string> {

        const cachedDigest: RequestDigest = this.cache[url];
        if (cachedDigest !== undefined && !cachedDigest.hasExpired) {
            return Promise.resolve(cachedDigest.value);
        }

        const webUrl: string = this.getWebUrl(url);
        const contextInfoUrl: string = combineUrl(webUrl, '/_api/contextinfo');
        return client
            .fetch(contextInfoUrl, {
                method: 'POST',
                headers: {
                    'accept': 'application/json;odata=verbose',
                    'content-type': 'application/json;odata=verbose;charset=utf-8'
                }
            })
            .then((json: any) => json.d.GetContextWebInformation)
            .then((data: any) => {
                const value: string = data.FormDigestValue;
                const seconds: number = data.FormDigestTimeoutSeconds;
                const expiration: Date = new Date();
                expiration.setSeconds(expiration.getSeconds() + seconds);
                const newCachedDigest: RequestDigest = new RequestDigest(value, expiration);
                this.cache[contextInfoUrl] = newCachedDigest;
                return newCachedDigest.value;
            });
    }

    private static getWebUrl(url: string): string {
        const index: number = url.indexOf('_api/');
        return index !== -1 ? url.substring(0, index) : url;
    }
}
