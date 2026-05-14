---
title: VFM Extension Hooks Guide
description: VFM 2.7 — captionlessImagePolicy, the editPlugins hook, and valibot-based plugin option schemas
lang: en
order: 5
---

# VFM Extension Hooks Guide

> **Target versions**: `@vivliostyle/vfm` v2.7+
> **Published**: 2026-05-14
> **Last updated**: 2026-05-14
>
> This guide is for users who call VFM **as a library** — custom builders, Astro / custom loaders, CI pipelines. If you just generate PDF/EPUB through Vivliostyle CLI, skim the **“When to reach for these”** section and stop there.

VFM 2.7 ships three new extension points that let external code tune VFM's behaviour more precisely than the existing flat options allow:

| Feature                          | Problem it solves                                                                                                          | Affects                                  |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `captionlessImagePolicy`         | Decide whether an image-only paragraph with empty `alt` becomes a `<figure>` or stays a `<p><img></p>`                     | Figure-related CSS styling               |
| `editPlugins` hook               | Splice, drop, or extend the unified plugin lists that VFM assembles internally                                             | Advanced pipeline customisation          |
| valibot-based plugin option schemas | VFM option schemas are exposed for downstream tools to compose, validate, and document                                  | Config validation, type generation       |

## When to reach for these

- You ship a book full of decorative images (rules, icons) and want to **stop them from becoming `<figure>`** → `captionlessImagePolicy: 'paragraph'`
- You want captionless images to still get a `<figcaption>` slot so counters keep working → `captionlessImagePolicy: 'figure-with-figcaption'`
- You need to inject a rehype plugin into VFM's pipeline → `editPlugins`
- You're writing a tool like `vivliostyle-cli` that wants to reuse VFM's option schemas → import the `*Schema` exports

---

## 1. `captionlessImagePolicy` — controlling captionless image paragraphs

### The problem

Historically, an **image-only paragraph** in Markdown is converted to a `<figure>` by VFM, with `alt` carried over to a `<figcaption>`. For example,

```markdown
![A bear illustration](./img/bear.png)
```

becomes

```html
<figure>
  <img src="./img/bear.png" alt="A bear illustration" />
  <figcaption aria-hidden="true">A bear illustration</figcaption>
</figure>
```

But what about **decorative images** with an empty `alt`?

```markdown
![](./img/divider.svg)
```

The previous handling was inconsistent across versions, and CSS such as `figure { counter-increment: figure; … }` ended up incrementing the figure counter for decorative images, throwing off figure numbering.

### The new option

VFM 2.7 adds `captionlessImagePolicy` with three values:

| Value                          | Output                                                | Use case                                                                                       |
| ------------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `'paragraph'` *(default)*      | `<p><img></p>`                                        | Decorative images stay inline. Backward-compatible default.                                    |
| `'figure'`                     | `<figure><img></figure>`                              | You want a `<figure>` block for layout, but no `<figcaption>` slot.                            |
| `'figure-with-figcaption'`     | `<figure><img><figcaption></figcaption></figure>`     | Keep an empty `<figcaption>` so `imgFigcaptionOrder` and figure counters apply uniformly. |

### Usage

Pass the option to `stringify` / `VFM`:

```js
import { stringify } from '@vivliostyle/vfm';

const html = stringify(markdown, {
  partial: true,
  captionlessImagePolicy: 'figure-with-figcaption',
});
```

It can also be set from YAML frontmatter:

```yaml
---
vfm:
  captionlessImagePolicy: figure
---
```

### Migration notes

- Upgrading from 2.6 to 2.7 alone does **not** change behaviour — the default `'paragraph'` matches the old output.
- **Themes using `figure { … }` rules**: when you switch to `'figure'`, decorative images will start matching those rules. Re-scope them with `figure:has(figcaption)` or `figure:not(.decoration)` as needed.

---

## 2. `editPlugins` — reshape the unified plugin lists

### The problem

VFM's `replace` option only handles "match a pattern → emit a HAST node". It can't reorder plugins, splice in a new rehype plugin **just before** the footnote stage, or drop a built-in plugin you don't want.

### The new hook

VFM 2.7 adds an `editPlugins(plugins)` hook called just before the unified processor is built.

```ts
type EditPlugins = (plugins: BuiltinPlugins) => EditedPlugins;
```

The `plugins` argument carries strictly typed brand identifiers for each built-in slot. The return value (`EditedPlugins`) widens to ordinary `unified.Pluggable[]` so you can splice, filter, or concat freely.

### Examples

Append `rehype-autolink-headings` to the hast stage:

```js
import { VFM } from '@vivliostyle/vfm';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

const processor = VFM({
  editPlugins(plugins) {
    return {
      ...plugins,
      hastPlugins: [
        ...plugins.hastPlugins,
        [rehypeAutolinkHeadings, { behavior: 'append' }],
      ],
    };
  },
});
```

Drop a specific built-in plugin (here: `remarkAttr`):

```js
const processor = VFM({
  editPlugins(plugins) {
    return {
      ...plugins,
      mdastPlugins: plugins.mdastPlugins.filter(
        (p) => !Array.isArray(p) || p[0]?.name !== 'remarkAttr',
      ),
    };
  },
});
```

### Warnings

- `editPlugins` can **override the default pipeline VFM assembled**. Replacing keys in `mdastToHastHandlers` (`paragraph`, `footnoteReference`, etc.) can break figure conversion or footnote rendering.
- The returned shape widens from the brand-typed `BuiltinPlugins` to a plain `EditedPlugins`. This is intentional — but means TypeScript won't catch every misuse. Always inspect the output HTML in tests.

---

## 3. valibot-based plugin option schemas

VFM 2.7.0 unifies option validation around [valibot](https://valibot.dev/) and **exports both the schemas and their inferred types**:

```ts
import {
  StringifyMarkdownOptionsSchema,
  FigureOptionsSchema,
  FootnoteOptionsSchema,
  ReplaceOptionsSchema,
  SerializablePluginOptionsSchema,
} from '@vivliostyle/vfm';
```

### What you can do with them

#### a. Validate user config at startup

```js
import * as v from 'valibot';
import { StringifyMarkdownOptionsSchema } from '@vivliostyle/vfm';

const parsed = v.parse(StringifyMarkdownOptionsSchema, userOptions);
```

Schema violations come back as `ValiError` instances with path-aware messages.

#### b. Build well-typed plugin options of your own

```js
import * as v from 'valibot';

const MyPluginOptionsSchema = v.object({
  mode: v.picklist(['inline', 'block']),
  prefix: v.optional(v.string(), 'fn'),
});

export function myPlugin(rawOptions) {
  const options = v.parse(MyPluginOptionsSchema, rawOptions);
  // …
}
```

#### c. Downstream tools reuse VFM's schemas

Vivliostyle CLI v10.6 derives its own config schema from `SerializablePluginOptionsSchema`, generating both runtime validation and JSON Schema docs from a single source of truth. You can do the same in any downstream tool.

### Design notes

- Schemas are composed with **`v.intersect`** and each sub-schema (`FigureOptionsSchema`, `FootnoteOptionsSchema`, …) is exported separately, so you can reuse one without dragging the whole API in.
- Inferred types are reachable via `v.InferInput<typeof ...Schema>`, but `StringifyMarkdownOptions` is also exported as a stable nominal interface so emitted `.d.ts` files don't leak `.pnpm/…` paths (TS2742).

---

## Related guides

- [Footnotes](../footnotes/) — the `footnote` option is also defined as a valibot schema
- [CMYK Conversion](../cmyk/)
- [Page Groups](../page-groups/)
- [Responsive Images & CSS Nesting](../responsive-and-nesting/) — new features on the Vivliostyle.js side

## References

- [VFM repository](https://github.com/vivliostyle/vfm)
- [valibot](https://valibot.dev/)
