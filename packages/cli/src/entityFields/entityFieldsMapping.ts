export interface EntityExpandFieldMapping {
    [key: string]: string;
    $name: string;
}

export interface EntityFieldsMapping {
    [key: string]: string | EntityExpandFieldMapping;
}
