# how DocsViewer computes field paths
```
Here is the deep, precise, ULDE‑accurate explanation of how DocsViewer computes field paths, so it can attach ownership metadata to the correct parts of the rendered document.

This is one of the most subtle but essential parts of the ULDE architecture, because the ownership map is keyed by canonical field paths, and DocsViewer must compute those paths exactly the same way the ownership registry does.

I’ll break it down into the four layers of path computation, each with inline Guided Links so you can explore any part in more depth.
```

__What “field path computation” means in DocsViewer__

DocsViewer must compute a canonical field path for every piece of data it renders, so it can look up ownership metadata from:

__[ownership-map.json]()__

Examples of canonical paths:

- content
- toc
- toc[].id
- links[].href
- frontmatter.tags[]
- search.keywords[]

These paths must match the ownership map exactly, or ownership metadata won’t attach.

## Layer 1 — Top‑Level Field Path Resolution

DocsViewer receives a UldeDocument object (from ULDE Core or your Angular adapter).
Every top‑level key becomes a top‑level field path.

Example:
```ts
{
  id: "index",
  slug: "intro",
  content: "<p>Hello</p>",
  toc: [ ... ],
  links: [ ... ]
}
```

DocsViewer computes:

- id
- slug
- content
- toc
- links

This is the simplest layer.

This matches the ownership map entries like:

- doc.id
- doc.slug
- content

## Layer 2 — Array Element Path Resolution ([] notation)

When DocsViewer encounters an array, it must compute:

- the array field path
- the element field path

ULDE uses index‑agnostic paths, so DocsViewer must use [] instead of numeric indices.

Example:
```ts
toc: [
  { id: "intro", title: "Introduction" },
  { id: "setup", title: "Setup" }
]
```

DocsViewer computes:

- toc[]
- toc[].id
- toc[].title

This matches ownership map entries like:

- toc
- toc[].id
- toc[].title

This is essential because ownership metadata is defined per field, not per array index.

## Layer 3 — Nested Object Path Resolution

DocsViewer recursively descends into nested objects.

Example:
```ts
frontmatter: {
  tags: ["angular", "ulde"],
  author: {
    name: "Masaaki",
    url: "https://example.com"
  }
}
```

DocsViewer computes:

- frontmatter
- frontmatter.tags[]
- frontmatter.author
- frontmatter.author.name
- frontmatter.author.url

These match ownership map entries like:

- frontmatter.tags
- frontmatter.author.name

## Layer 4 — Rendered HTML → Field Path Mapping

This is the most subtle part.

DocsViewer renders HTML from content, but ownership metadata still applies to the source field, not the HTML nodes.

So DocsViewer must:

1. Track which rendered DOM nodes originate from which field
2. Attach ownership metadata to the DOM node
3. Display ownership badges/tooltips in the UI

Example:
```html
<h2 id="intro">Introduction</h2>
```

DocsViewer knows:

- This came from the content field
- The heading ID intro also appears in toc[].id
- Ownership metadata for both fields may be relevant

So DocsViewer attaches:

- content metadata to the HTML block
- toc[].id metadata to the anchor/heading

This is how the UI can show:

- “Owned by MarkdownPipeline”
- “Referenced by TOCPlugin”
- “Lifecycle: stable”

See: __[Integrate ownership metadata into Angular DocsViewer]()__


# How DocsViewer Computes Paths Internally

DocsViewer uses a recursive walker:

1. Start with an empty path: ""
2. For each key:

>- append the key: path + "." + key

3. If value is an array:

>- append []

4. If value is an object:

>- recurse

5. Normalize:

>- remove leading dots
>- collapse double dots
>- ensure array notation is correct

This produces canonical paths identical to the ownership map.

# Why Field Path Computation Matters

✔ __Ownership metadata attaches correctly__
If paths don’t match, DocsViewer can’t show ownership badges.

✔ __Auto‑insertion script and DocsViewer stay in sync__
Both rely on the same canonical paths.

✔ __Plugins become transparent__
Users can see exactly which plugin touches which field.

✔ __ULDE becomes teaching‑friendly__
Ownership metadata appears directly in the UI.

# Summary Table
| Structure | Example | Computed Path |
| --- | --- | --- |
| Top‑level field | ``content`` | ``content`` |
| Array | ``toc: ``[]`` | ``toc[]`` |
| Array element field | ``toc[i].id`` | ``toc[].id`` |
| Nested object | ``frontmatter.author.name`` | ``frontmatter.author.name`` |
| HTML node | ``<h2>`` from content | ``content`` |

DocsViewer must compute these paths exactly to match the ownership map.
