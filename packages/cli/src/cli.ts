#!/usr/bin/env node

import chalk from 'chalk';
import program, { Command } from 'commander';
import * as path from 'path';
import { generate } from '.';
import { configFileName } from './constants';
import { generateDefaultConfig } from './generateDefaultConfig';
import { Auth } from './sp';

const { version } = require(path.join(__dirname, '..', 'package.json'));

(function main(): void {

    program
        .name('spe')
        .usage('<config>')
        .description('sp-entity generator')
        .version(version, '-v --version');

    program
        .command('*', '', { noHelp: true })
        .action((configPath: string, cmd: Command) => {
            generate(path.resolve(configPath)).catch(handleError);
        });

    program
        .command('init')
        .description(`Generate default ${configFileName}`)
        .action((cmd: Command) => {
            generateDefaultConfig().catch(handleError);
        });

    program
        .command('login')
        .description('Store encrypted login credentials for context sharepoint site')
        .action((cmd: Command) => {
            Auth.login().catch(handleError);
        });

    program
        .command('logout')
        .description('Remove stored login credentials for context sharepoint site')
        .action((cmd: Command) => {
            Auth.logout();
        });

    program.parse(process.argv);

    if (program.args.length === 0) {
        program.help();
    }
})();

function handleError(error: any): void {
    console.log(chalk.redBright(error));
    process.exit();
}
