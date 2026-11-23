export type TextRecognizer = {
  recognize(uri: string): Promise<{ text: string }>;
};
