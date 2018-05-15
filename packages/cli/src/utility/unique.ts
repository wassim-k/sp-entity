export type Unique = (text: string) => string;

export function unique(): Unique {

    const taken: { [unique: string]: boolean } = {};

    return (text: string): string => {

        let uniqueText: string = text;
        for (let i: number = 2; taken[uniqueText]; ++i) {
            uniqueText = `${text}${i}`;
        }
        taken[uniqueText] = true;
        return uniqueText;
    };
}
