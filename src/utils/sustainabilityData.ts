import config from '../config';

export interface SustainabilityData {
  mesh: number;
  water: number;
  energy: number;
  co2: number;
}

export const getSustainabilityData = (goldenStopsCount: number): SustainabilityData => {
  return {
    water: goldenStopsCount * config.SUSTAINABILITY_VALUES_WATER,
    energy: goldenStopsCount * config.SUSTAINABILITY_VALUES_ENERGY,
    mesh: goldenStopsCount * config.SUSTAINABILITY_VALUES_MESH,
    co2: goldenStopsCount * config.SUSTAINABILITY_VALUES_CO2,
  };
};
