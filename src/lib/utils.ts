import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) {
        return 'N/A';
    }
    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
    }).format(value);
};

export const normalizeText = (text: string): string => {
    if (typeof text !== 'string') {
        text = String(text);
    }
    return text
        .replace(/ł/g, 'l').replace(/Ł/g, 'L')
        .replace(/ą/g, 'a').replace(/Ą/g, 'A')
        .replace(/ę/g, 'e').replace(/Ę/g, 'E')
        .replace(/ć/g, 'c').replace(/Ć/g, 'C')
        .replace(/ń/g, 'n').replace(/Ń/g, 'N')
        .replace(/ó/g, 'o').replace(/Ó/g, 'O')
        .replace(/ś/g, 's').replace(/Ś/g, 'S')
        .replace(/ż/g, 'z').replace(/Ż/g, 'Z')
        .replace(/ź/g, 'z').replace(/Ź/g, 'Z');
};
