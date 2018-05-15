export class SpException extends Error {

    public readonly response: Response;
    public readonly data: any;
    public readonly code: string | undefined;
    public readonly error: string | undefined;

    public constructor(response: Response, data?: any) {
        super(`${response.statusText} (${response.status})`);
        this.name = 'SpException';
        this.response = response;

        if (typeof data !== 'undefined') {
            this.data = data;
            const error: any | undefined = data['error'] || data['odata.error'];
            if (error) {
                this.code = error.code;
                this.error = error.message.value;
            }
        }
    }
}
