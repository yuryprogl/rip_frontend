export interface Element {
  id: number;
  name: string;
  description: string;
  formula: string;
  image: string | null; // В вашем API поле называется 'image'
}

export interface CartInfo {
  elements_count: number;
  draft_forecast: number | null;
}
