export interface IHttpClientImpl {
    fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
}

export interface SpeConfig {

    /**
     * Custom headers applied to all requests
     */
    headers?: { [key: string]: string };

    /**
     * Factory method for creating fetch client (default uses window.fetch)
     */
    fetchClientFactory?: () => IHttpClientImpl;
}
