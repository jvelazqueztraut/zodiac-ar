import { SPRITES } from 'utils/config.assets';

export enum FilterTypes {
  Sun = 0,
  Moon = 1,
  Rising = 2,
}

export const FilterTypeNames = {
  [FilterTypes.Sun]: 'Sun',
  [FilterTypes.Moon]: 'Moon',
  [FilterTypes.Rising]: 'Rising',
};

export const FilterTypeIcons = {
  [FilterTypes.Sun]: SPRITES.SunIcon,
  [FilterTypes.Moon]: SPRITES.MoonIcon,
  [FilterTypes.Rising]: SPRITES.RisingIcon,
};

export const FilterTypeAssets = {
  [FilterTypes.Sun]: 'piscis',
  [FilterTypes.Moon]: 'sagittarius',
  [FilterTypes.Rising]: 'taurus',
};
