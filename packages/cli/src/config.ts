export interface EntityConfig {
    entityName: string;
    listName: string;
}

export interface Config {
    odataVerbose: boolean;
    entities: Array<EntityConfig>;
}
