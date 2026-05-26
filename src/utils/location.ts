import { locationTree } from '../data/locations';
import { LocationSelection } from '../types/navigation';

export function getMockLocation(): LocationSelection {
  return {
    country: 'United States',
    region: 'California',
    city: 'Los Angeles',
  };
}

export function getRegions(country: string) {
  return locationTree.find((item) => item.country === country)?.regions ?? [];
}

export function getCities(country: string, region: string) {
  return getRegions(country).find((item) => item.name === region)?.cities ?? [];
}
