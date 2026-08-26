/**
 * Vehicle category + sub-type definitions for Fleet Management.
 * Used in forms, API validation, and filtering.
 */

export interface VehicleCategory {
  label: string;
  value: string;
  icon: string; // emoji icon for UI
  types: string[];
}

export const VEHICLE_CATEGORIES: VehicleCategory[] = [
  {
    label: "Trucks",
    value: "Trucks",
    icon: "🚛",
    types: [
      "Heavy Truck",
      "Light Truck",
      "Pickup Truck",
      "Cargo Truck",
      "Dump Truck",
      "Flatbed Truck",
      "Tanker Truck",
      "Refrigerated Truck",
      "Tractor Head / Prime Mover",
    ],
  },
  {
    label: "Trailers",
    value: "Trailers",
    icon: "🚚",
    types: [
      "Flatbed Trailer",
      "Container Trailer",
      "Tanker Trailer",
      "Refrigerated Trailer",
      "Low-Bed Trailer",
    ],
  },
  {
    label: "Cars",
    value: "Cars",
    icon: "🚗",
    types: [
      "Company Car",
      "Sedan",
      "SUV",
      "Executive Vehicle",
    ],
  },
  {
    label: "Vans",
    value: "Vans",
    icon: "🚐",
    types: [
      "Cargo Van",
      "Passenger Van",
      "Delivery Van",
      "Minivan",
    ],
  },
  {
    label: "Heavy Equipment",
    value: "Heavy Equipment",
    icon: "🏗️",
    types: [
      "Excavator",
      "Bulldozer",
      "Forklift",
      "Loader",
      "Crane",
      "Generator",
    ],
  },
];

/** Returns the types list for a given category value */
export function getTypesForCategory(category: string): string[] {
  return VEHICLE_CATEGORIES.find((c) => c.value === category)?.types ?? [];
}

/** All category values as a flat array */
export const ALL_CATEGORY_VALUES = VEHICLE_CATEGORIES.map((c) => c.value);
