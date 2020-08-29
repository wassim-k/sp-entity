import camelCase from 'camelcase';

export class TextUtil {

    public static kebabCase(text: string): string {
        text = this.camelCase(text);
        return text.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
    }

    public static camelCase(text: string): string {
        text = this.removeDiacritics(text);
        text = this.removeNonWordChars(text);
        return camelCase(text);
    }

    public static titleCase(text: string): string {
        text = this.camelCase(text);
        return `${text[0].toUpperCase()}${text.substring(1)}`;
    }

    private static removeNonWordChars(text: string): string {
        return text.replace(/[^\w]/g, ' ');
    }

    private static removeDiacritics(text: string): string {
        return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
}
