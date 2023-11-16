export type Base = {
  baseId: `app${string}`;
  tableName: string;
  viewId: `viw${string}`;
  fields: { [fieldName: string]: `fld${string}` };
};

export type AwardTier = "Gold" | "Silver" | "Bronze";

export type AwardDetails = {
  year: number;
  tier: AwardTier;
  anchor?: string;
};
