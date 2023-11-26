export type AirtableBase = {
  baseId: `app${string}`;
  tableName: string;
  viewId: `viw${string}`;
  fields: Record<string, `fld${string}`>;
};

export type AwardTier = "Gold" | "Silver" | "Bronze";

export type AwardDetails = {
  year: number;
  tier: AwardTier;
  anchor?: `#${string}`;
};

export type RecordBase = {
  recordId: string;
};

// internal links should have a trailing slash to prevent redirects
export type Permalink = `${string}/`;
