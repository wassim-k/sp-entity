import fs from 'fs-extra';
import path from 'path';

export class FsUtil {

    public static ensureFolder(...pathSegments: Array<string>): string {

        const folderPath: string = path.resolve(...pathSegments);

        if (!fs.existsSync(folderPath)) {
            fs.mkdirpSync(folderPath);
        }

        return folderPath;
    }

    public static createFile(folderPath: string, filename: string, contents: string, overwrite: boolean = true): void {

        const p: string = path.resolve(folderPath, filename);
        if (overwrite || !fs.existsSync(p)) {
            fs.writeFileSync(p, contents);
        }
    }
}
