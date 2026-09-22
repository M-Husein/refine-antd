import { useState, useCallback } from 'react'; // , type ChangeEvent

export interface FilterState {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  sepia: number; // 0 to 100%
  grayscale: number; // 0 to 100%
  invert: number; // 0 to 100%
}

export const DEFAULT_FILTERS: FilterState = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  sepia: 0,
  grayscale: 0,
  invert: 0,
};

export type PresetName =
  | 'None'
  | 'Sepia'
  | 'Grayscale'
  | 'Vintage'
  | 'Warm'
  | 'Cool'
  | 'Dramatic';

export const FILTER_PRESETS: Record<PresetName, FilterState> = {
  None: DEFAULT_FILTERS,
  Sepia: {
    ...DEFAULT_FILTERS,
    sepia: 80,
    contrast: 10,
    brightness: -5,
  },
  Grayscale: {
    ...DEFAULT_FILTERS,
    grayscale: 100,
    contrast: 15,
  },
  Vintage: {
    brightness: 5,
    contrast: -10,
    saturation: -20,
    hue: 10,
    sepia: 30,
    grayscale: 0,
    invert: 0,
  },
  Warm: {
    ...DEFAULT_FILTERS,
    brightness: 10,
    saturation: 20,
    hue: -10,
    sepia: 15,
  },
  Cool: {
    ...DEFAULT_FILTERS,
    brightness: 5,
    contrast: 5,
    saturation: -10,
    hue: 15,
  },
  Dramatic: {
    ...DEFAULT_FILTERS,
    contrast: 40,
    saturation: 30,
    brightness: -10,
  },
};

export const useImageFilters = (
  initialFilters: FilterState = DEFAULT_FILTERS
) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [activePreset, setActivePreset] = useState<PresetName>('None');

  const setFilterValue = useCallback(
    (filterKey: keyof FilterState, value: number) => {
      setFilters((prev) => ({
        ...prev,
        [filterKey]: value,
      }));
      setActivePreset('None'); // Reset preset highlight when custom manual tweaks are made
    },
    []
  );

  const handleFilterChange = useCallback(
    (filterKey: keyof FilterState) => (val: number) => { // e: ChangeEvent<HTMLInputElement>
      // const parsedValue = +e.target.value; // Number.parseFloat(e.target.value);
      setFilterValue(
        filterKey, 
        Number.isNaN(val) ? 0 : val
      );
    },
    [setFilterValue]
  );

  const applyPreset = useCallback((presetName: PresetName) => {
    setFilters(FILTER_PRESETS[presetName] || DEFAULT_FILTERS);
    setActivePreset(presetName);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setActivePreset('None');
  }, []);

  const getCssFilterString = useCallback(() => {
    const bri = 1 + filters.brightness / 100;
    const con = 1 + filters.contrast / 100;
    const sat = 1 + filters.saturation / 100;
    const hue = filters.hue;
    const sep = filters.sepia / 100;
    const gray = filters.grayscale / 100;
    const inv = filters.invert / 100;

    return `brightness(${bri}) contrast(${con}) saturate(${sat}) hue-rotate(${hue}deg) sepia(${sep}) grayscale(${gray}) invert(${inv})`;
  }, [filters]);

  return {
    filters,
    activePreset,
    setFilters,
    setFilterValue,
    handleFilterChange,
    applyPreset,
    resetFilters,
    getCssFilterString,
  };
};
