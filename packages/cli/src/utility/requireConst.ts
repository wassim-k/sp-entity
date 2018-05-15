import fs from 'fs';

export function requireConst<T = object>(filename: string): T {

    const contents: string = fs.readFileSync(filename, 'utf8');
    const regex: RegExp = /[\s\S]*?const.*?(\{[\s\S]*\})/;
    const matches: RegExpExecArray | null = regex.exec(contents);
    if (matches && matches.length === 2) {
        const constStr: string = matches[1];
        return eval(`(${constStr})`); // tslint:disable-line
    } else {
        throw new Error(`Invalid fields mapping: ${filename}`);
    }
}
