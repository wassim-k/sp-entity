import { IHttpClientImpl } from '@pnp/common';
import { RequestDigest } from './requestDigest';
import { SpException } from './spException';

export class SpeHttpClient {

    private static _instance: SpeHttpClient;

    public headers: { [key: string]: string };

    private _fetchClient: IHttpClientImpl | undefined;

    private constructor() {
        this.headers = {};
    }

    public static get instance(): SpeHttpClient {
        if (this._instance === undefined) {
            this._instance = new SpeHttpClient();
        }
        return this._instance;
    }

    public set fetchClient(value: IHttpClientImpl) {
        this._fetchClient = value;
    }

    public get fetchClient(): IHttpClientImpl {
        const g: any = typeof global !== 'undefined' ? global : window;
        if (this._fetchClient !== undefined) {
            return this._fetchClient;
        } else if (g !== undefined && typeof g.fetch === 'function') {
            return g as any;
        } else {
            throw new Error(`fetchClient is not set`);
        }
    }

    public get(url: string, options: RequestInit = {}): Promise<any> {
        options.method = 'GET';
        return this.fetch(url, options);
    }

    public post(url: string, options: RequestInit = {}): Promise<any> {
        options.method = 'POST';
        return RequestDigest.get(url, this).then((requestDigest: string) => {
            this.addHeaders(options, { 'X-RequestDigest': requestDigest });
            return this.fetch(url, options);
        });
    }

    public delete(url: string, options: RequestInit = {}): Promise<any> {
        options.method = 'DELETE';
        return RequestDigest.get(url, this).then((requestDigest: string) => {
            this.addHeaders(options, { 'X-RequestDigest': requestDigest });
            return this.fetch(url, options);
        });
    }

    public fetch(url: string, options?: RequestInit): Promise<any> {
        return this.fetchClient
            .fetch(url, this.ensureOptions(options))
            .then((response: Response) => {
                if (response.ok) {
                    if (this.isJson(response)) {
                        return response.json();
                    } else {
                        return undefined;
                    }
                } else {
                    return response.json()
                        .catch(() => {
                            throw new SpException(response);
                        })
                        .then((json: any) => {
                            throw new SpException(response, json);
                        });
                }
            });
    }

    private isJson(response: Response): boolean {
        const contentType: string = response.headers.get('content-type') || '';
        return response.status !== 204 && contentType.indexOf('application/json') !== -1;
    }

    private ensureOptions(options: RequestInit = {}): RequestInit {
        this.addHeaders(options, {
            'accept': 'application/json',
            'content-type': 'application/json;odata=verbose;charset=utf-8',
            ...this.headers
        });
        return {
            cache: 'no-cache',
            credentials: 'same-origin',
            ...options
        };
    }

    private addHeaders(options: RequestInit, headers: { [key: string]: string }): void {
        const allHeaders: Headers = new Headers(options.headers || {});
        for (const name of Object.keys(headers)) {
            if (!allHeaders.has(name)) {
                allHeaders.set(name, headers[name]);
            }
        }
        options.headers = allHeaders;
    }
}
