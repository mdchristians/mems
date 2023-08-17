export type ImageColors =
  | {
      dominant_color: string | null;
      entropy: number | null;
      sharpness: number | null;
      is_opaque: boolean | null;
      palette: ColorPalette | null;
    }
  | undefined
  | Record<string, never>;

export type ColorPalette =
  | {
      vibrant:
        | {
            color: string;
            population: number;
          }
        | undefined;
      darkVibrant:
        | {
            color: string;
            population: number;
          }
        | undefined;
      lightVibrant:
        | {
            color: string;
            population: number;
          }
        | undefined;
      muted:
        | {
            color: string;
            population: number;
          }
        | undefined;
      darkMuted:
        | {
            color: string;
            population: number;
          }
        | undefined;
      lightMuted:
        | {
            color: string;
            population: number;
          }
        | undefined;
    }
  | undefined
  | Record<string, never>;
