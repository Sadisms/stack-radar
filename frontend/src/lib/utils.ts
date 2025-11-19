import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type ClassValue = string | number | null | undefined | ClassDictionary | ClassArray

interface ClassDictionary {
	[id: string]: any
}

interface ClassArray extends Array<ClassValue> {}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
