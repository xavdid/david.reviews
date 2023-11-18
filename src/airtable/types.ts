export type Base = {
  baseId: `app${string}`;
  tableName: string;
  viewId: `viw${string}`;
  fields: Record<string, `fld${string}`>;
};

export type AwardTier = "Gold" | "Silver" | "Bronze";

export type AwardDetails = {
  year: number;
  tier: AwardTier;
  anchor?: string;
};

export type RecordBase = {
  recordId: string;
};
