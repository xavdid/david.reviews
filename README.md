# david.reviews

➡️ https://david.reviews ⬅️

This is an [Astro](https://astro.build/) + [Tailwind](https://tailwindcss.com/) site which collects all of my media micro-reviews. Data is stored in [Airtable](https://airtable.com/) an loaded using a custom ORM. It ships remarkably little JS to the frontend.

## ORM

I wrote a [custom typed ORM](https://xavd.id/blog/post/static-review-site-with-airtable/) for loading Airtable data. To add new fields:

1. Go to [the docs page](https://airtable.com/developers/web/api/introduction) and select your base
2. Find the `fld...` ids you're adding
3. Add them (and a name) to the `SCHEMA.fields` object in the `airtable/data/<BASE>.ts` file
4. If any added fields aren't `string`s, add them (by `field.NAME`) to `NonStringFields`
5. Add the relevant output fields to the exported type. This represents the object returned by `materialize` (which turns a row into a usable object)
6. Ensure those new types get materialized

## Misc

- I shrink images using https://compresspng.com/
