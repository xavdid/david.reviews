export type AirtableBase = {
  baseId: `app${string}`;
  tableName: string;
  viewId: `viw${string}`;
  fields: Record<string, `fld${string}`>;
};

export type RecordBase = {
  recordId: string;
};

// internal links should have a trailing slash to prevent browser redirects
export type Permalink = `${string}/`;

export type ExternalUrl = `https://${string}`;

export type Collection = {
  fullName: string; // "🔎 Murder Mystery"
  nameOnly: string; // "Murder Mystery"
  emoji: string; // "🔎"
  slug: string; // "murder-mystery"
  permalink: Permalink; // "/collections/murder-mystery"
};
