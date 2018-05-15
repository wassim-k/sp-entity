import chalk from 'chalk';
import fs from 'fs';
import { AuthConfig, IAuthContext } from 'node-sp-auth-config';
import os from 'os';
import path from 'path';

export class Auth {

    public static readonly configPath: string = path.resolve(os.homedir(), '.sp-entity', 'auth.json');

    public static async login(): Promise<IAuthContext> {
        const authContext: IAuthContext = await this.getAuthContext(true);
        console.log('\nYou are currently logged in to', chalk.green(authContext.siteUrl));
        return authContext;
    }

    public static logout(): void {
        if (this.isLoggedIn) {
            this.deleteAuthFile();
            console.log('\nYou have been logged out');
        } else {
            console.warn(chalk.yellow('\nYou are not currently logged in to a site'));
        }
    }

    public static deleteAuthFile(): void {
        if (this.isLoggedIn) { fs.unlinkSync(this.configPath); }
    }

    public static async getAuthContext(saveConfigOnDisk: boolean = false): Promise<IAuthContext> {

        const { configPath } = this;
        const authConfig: AuthConfig = new AuthConfig({
            configPath,
            saveConfigOnDisk,
            encryptPassword: true
        });

        const authContext: IAuthContext = await authConfig.getContext();
        return authContext;
    }

    private static get isLoggedIn(): boolean {
        return fs.existsSync(this.configPath);
    }
}
