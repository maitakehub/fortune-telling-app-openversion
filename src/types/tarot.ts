export interface TarotCard {
  name: string;
  meaning: {
    upright: string;
    reversed: string;
  };
  element: string;
  keywords: string[];
  description?: string;
  position?: string;
} 