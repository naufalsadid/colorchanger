export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  textColor: string; // To ensure text is readable on the background
}

export interface GenerationState {
  isLoading: boolean;
  resultImage: string | null;
  error: string | null;
}