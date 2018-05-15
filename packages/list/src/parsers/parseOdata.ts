export function parseOdata<T>(json: any): T {

    if (json.hasOwnProperty('d')) {
        return json.d;
    } else if (json.hasOwnProperty('value')) {
        return json.value;
    } else {
        return json;
    }
}
