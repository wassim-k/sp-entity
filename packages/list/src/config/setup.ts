import { SpeHttpClient } from '../httpClient';
import { SpeConfig } from './speConfig';

export function setup(config: SpeConfig): void {

    if (typeof config.fetchClientFactory === 'function') {
        SpeHttpClient.instance.fetchClient = config.fetchClientFactory();
    }

    if (typeof config.headers === 'object') {
        SpeHttpClient.instance.headers = config.headers;
    }
}
