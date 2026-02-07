export const deliveryZoneIds = [
  "anantnag",
  "srinagar",
  "south-kashmir",
  "north-kashmir",
  "outside-kashmir"
] as const;

export type DeliveryZoneId = typeof deliveryZoneIds[number];

export type DeliveryZoneRule = {
  id: DeliveryZoneId;
  label: string;
  delayMultiplier: number;
  hourlyLimitCap: number;
};

const deliveryZones: DeliveryZoneRule[] = [
  { id: "anantnag", label: "Anantnag", delayMultiplier: 1, hourlyLimitCap: 200 },
  { id: "srinagar", label: "Srinagar", delayMultiplier: 1, hourlyLimitCap: 200 },
  { id: "south-kashmir", label: "South Kashmir", delayMultiplier: 1.15, hourlyLimitCap: 150 },
  { id: "north-kashmir", label: "North Kashmir", delayMultiplier: 1.2, hourlyLimitCap: 150 },
  { id: "outside-kashmir", label: "Outside Kashmir", delayMultiplier: 1.35, hourlyLimitCap: 100 }
];

const zonesById = new Map(deliveryZones.map((zone) => [zone.id, zone]));

export const getDeliveryZoneRule = (zoneId?: DeliveryZoneId) => {
  if (!zoneId) {
    return zonesById.get("anantnag") as DeliveryZoneRule;
  }
  return zonesById.get(zoneId) ?? (zonesById.get("anantnag") as DeliveryZoneRule);
};

export const listDeliveryZones = () => deliveryZones;
