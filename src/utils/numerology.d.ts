export interface NumerologyParams {
  birthDate: string;
  name?: string;
}

export function calculateNameNumber(name: string): number;
export function calculateDestinyNumber(birthDate: string): number;
export function generateNumerologyReading(params: NumerologyParams): Promise<string>;
