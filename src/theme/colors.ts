export interface ColorTheme {
  background: string;
  surface: string;
  surfaceSubtle: string;
  text: string;
  textSecondary: string;
  gray: string;
  border: string;
  accent: string;
  accentLight: string;
  sunIcon: string;
  danger: string;
  dangerLight: string;
  success: string;
  successTick: string;
  phoneFrame: string;
  phoneFrameBorder: string;
  blocks: {
    sen: string;
    poranek: string;
    szkola: string;
    trening: string;
    kolacja: string;
    cfg: string;
    wyciszenie: string;
  };
  palette: string[];
}

export const lightTheme: ColorTheme = {
  background: '#F4F5F7',
  surface: '#FFFFFF',
  surfaceSubtle: '#ECEFF3',
  text: '#1F2933',
  textSecondary: '#7B8794',
  gray: '#7B8794',
  border: '#DCE0E6',
  accent: '#2F4A6B', // granat
  accentLight: '#E5ECF4',
  sunIcon: '#B08D57',
  danger: '#D96B6B',
  dangerLight: '#FDECEC',
  success: '#6B9080',
  successTick: '#6A877A', // zielonkawo-szary tick
  phoneFrame: '#1E232A',
  phoneFrameBorder: '#383F4A',
  blocks: {
    sen: '#D9DDE5',
    poranek: '#E6E1D8',
    szkola: '#C3CEDC',
    trening: '#CDD8D2',
    kolacja: '#E3E0DB',
    cfg: '#CBD0DC',
    wyciszenie: '#D3DAD8',
  },
  palette: [
    '#D9DDE5', // Sen
    '#E6E1D8', // Poranek
    '#C3CEDC', // Szkoła
    '#CDD8D2', // Trening
    '#E3E0DB', // Kolacja
    '#CBD0DC', // CFG
    '#D3DAD8', // Wyciszenie
    '#E0D8D0', // Beż dodatkowy
    '#CCD9E4', // Błękit
    '#D6DFD5', // Mięta
  ],
};

export const darkTheme: ColorTheme = {
  background: '#14181D', // grafit
  surface: '#1E252C',    // karty
  surfaceSubtle: '#262F38',
  text: '#F0F4F8',
  textSecondary: '#8B97A5',
  gray: '#8B97A5',
  border: '#2A3441',
  accent: '#4C719B',     // granatowy akcent
  accentLight: '#243242',
  sunIcon: '#D4AF37',
  danger: '#E57373',
  dangerLight: '#382525',
  success: '#7FA894',
  successTick: '#7E9C8E',
  phoneFrame: '#0C0E11',
  phoneFrameBorder: '#1F242C',
  blocks: {
    sen: '#2A303A',
    poranek: '#38332C',
    szkola: '#253446',
    trening: '#263730',
    kolacja: '#34302A',
    cfg: '#2B3240',
    wyciszenie: '#283634',
  },
  palette: [
    '#2A303A',
    '#38332C',
    '#253446',
    '#263730',
    '#34302A',
    '#2B3240',
    '#283634',
    '#38302B',
    '#293748',
    '#2A3A35',
  ],
};

// Default backward-compatible export
export const colors = lightTheme;
