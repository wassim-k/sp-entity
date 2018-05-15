import { SpeHttpClient } from '../httpClient';
import { SpeConfig } from './speConfig';

export const httpClient: SpeHttpClient = new SpeHttpClient();

export function setup(config: SpeConfig): void {

    if (typeof config.fetchClientFactory === 'function') {
        httpClient.fetchClient = config.fetchClientFactory();
    }

    if (typeof config.headers === 'object') {
        httpClient.headers = config.headers;
    }
}
