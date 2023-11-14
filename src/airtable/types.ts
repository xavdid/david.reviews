export type Base = {
  baseId: string;
  tableName: string;
  viewId: string;
  fields: { [fieldName: string]: string };
};

export type AwardTier = "Gold" | "Silver" | "Bronze";

export type AwardDetails = {
  year: number;
  tier: AwardTier;
  anchor?: string;
};
