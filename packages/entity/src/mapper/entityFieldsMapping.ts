export interface EntityExpandFieldMapping {
    [key: string]: string | undefined;
    $name: string;
}

export interface EntityFieldsMapping {
    [key: string]: string | EntityExpandFieldMapping | undefined;
}
