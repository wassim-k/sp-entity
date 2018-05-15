import chalk from 'chalk';
import fs from 'fs';
import inquirer from 'inquirer';
import { IAuthContext } from 'node-sp-auth-config';
import path from 'path';
import { Config } from './config';
import { configFileName } from './constants';
import { Auth, ODataList, SpRestClient } from './sp';
import { FsUtil, TextUtil, Unique, unique } from './utility';

export async function generateDefaultConfig(): Promise<void> {

    const authContext: IAuthContext = await Auth.getAuthContext();
    if (authContext === undefined) { return; }
    const spClient: SpRestClient = await SpRestClient.create(authContext);

    const answers: inquirer.Answers = await inquirer.prompt({
        name: 'folder',
        message: 'Data context folder name?',
        default: 'dataContext'
    });

    const uniqueEntityName: Unique = unique();
    const lists: Array<ODataList> = await spClient.getLists();
    const config: Config = {
        odataVerbose: spClient.spVer === 15,
        entities: lists.map((list: ODataList) => ({
            entityName: uniqueEntityName(TextUtil.titleCase(list.Title)),
            listName: list.Title
        }))
    };

    // Remove if default value
    if (!config.odataVerbose) {
        delete config.odataVerbose;
    }

    const candidatePath: string = path.resolve(answers.folder, configFileName);
    if (fs.existsSync(candidatePath)) {
        throw new Error(`A config file already exists at ${chalk.yellow(candidatePath)}`);
    } else {
        const folderPath: string = FsUtil.ensureFolder(answers.folder);
        FsUtil.createFile(folderPath, configFileName, JSON.stringify(config, undefined, 4), true);
    }
}
