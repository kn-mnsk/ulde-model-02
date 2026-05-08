# how the registry feeds the auto‑insertion script 

```
Here is the full, end‑to‑end, ULDE‑accurate “Registry → Auto‑Insertion Script” flow, written as a single coherent pipeline so you can see exactly how metadata moves through your model ULDE project.

This is the most important internal flow in ULDE, because it connects:

- plugin declarations (Thread 1)
- the canonical ownership map (Thread 2)
- the auto‑insertion script
- the updated code + docs
- the Angular DocsViewer teaching layer

Every stage includes Guided Links so you can dive deeper into any part of the pipeline.
```

__High‑Level Pipeline__

Plugins → Ownership Registry → Canonical JSON → Auto‑Insertion Script → Updated Code + Docs → DocsViewer

This is the ULDE metadata pipeline.

## 1. Plugins Declare Ownership (Thread 1)
Each plugin exports a UldeOwnershipContributor:

```ts
export const TocPluginOwnership = {
  pluginName: "TOCPlugin",
  contributeOwnership() {
    return {
      "toc": {
        owner: "TOCPlugin",
        readers: ["DocsViewer"],
        writers: ["TOCPlugin"],
        lifecycle: "stable"
      },
      "toc[].id": {
        owner: "TOCPlugin",
        readers: ["SearchIndexPlugin"],
        writers: ["TOCPlugin"],
        lifecycle: "stable"
      }
    }
  }
}
```
Plugins declare:

- owner
- readers
- writers
- lifecycle
- description

This is plugin‑centric metadata.

## 2. Ownership Registry Loads All Contributors

The registry collects all plugin contributions:
```ts
const registry = new UldeOwnershipRegistry([
  UldeCoreOwnership,
  TocPluginOwnership,
  LinkResolutionOwnership,
  // …
])
```

The registry:

- loads contributors
- calls contributeOwnership()
- merges field entries
- checks for conflicts
- validates lifecycle phases

This produces the field‑centric view.

This is the __[registry merge step]()__.

## 3. Registry Produces the Canonical Ownership Map JSON

After merging + validation, the registry emits:
```
/ulde/ownership/ownership-map.json
```

This file is:

- complete
- lifecycle‑sorted
- conflict‑free
- machine‑readable
- ready for tooling

This is the complete JSON ownership map.

This is the single source of truth for ownership.

## 4. Auto‑Insertion Script Loads the Canonical JSON

The auto‑insertion script reads:

- the canonical ownership map
- the TypeScript source files
- the Markdown docs
- the Angular metadata files

It uses the ownership map to know:

- which fields exist
- who owns them
- which plugins read/write them
- what lifecycle they’re in

This is the __[auto‑insertion loader]()__.

## 5. Script Parses Code (AST)

The script uses an AST parser to safely locate:

- fields in UldeArtifacts
- plugin metadata fields
- Angular DocsViewer metadata
- Markdown frontmatter

It matches ownership map paths like:

- toc
- toc[].id
- links[].href
- content

This is the field matcher stage.

## 6. Script Generates Ownership Comments

For each field, the script generates a JSDoc block:
```ts
/**
 * Owner: MarkdownPipeline
 * Readers: DocsViewer, SearchIndexPlugin
 * Writers: MarkdownPipeline
 * Lifecycle: stable
 */
content: string
```

This is the comment generator stage.

## 7. Script Inserts or Updates Comments (Idempotent)

The script:

- inserts comments above fields
- updates existing ownership blocks
- preserves formatting
- ensures repeated runs produce no diff

This is the __[idempotency layer]()__.

## 8. Script Writes Updated Files

The script writes:

- updated TypeScript files
- updated Markdown docs
- updated Angular metadata

This is the final output of the pipeline.

## 9. DocsViewer Loads Ownership Metadata

Angular DocsViewer loads the ownership map via an OwnershipService, then displays:

- owner badges
- lifecycle tags
- read/write surfaces
- plugin tooltips

This is the teaching layer.

See: __[Integrate ownership metadata into Angular DocsViewer]()__

# Why This Flow Matters

__ULDE becomes self‑documenting__<br>
Ownership is always correct and always visible.

__Plugins become predictable__<br>
No hidden behavior. No undocumented field access.

__DocsViewer becomes teaching‑friendly__<br>
Ownership metadata appears directly in the UI.

__Tooling becomes possible__<br>
You can build:

- ownership conflict detectors
- plugin dependency graphs
- lifecycle migration tools

All powered by the same JSON.

# Summary Table
| Stage | Output | Purpose |
| --- | --- | --- |
| **Plugins** | plugin‑centric metadata | Declares read/write/ownership |
| **Registry** | canonical ownership map | Merges + validates |
| **Auto‑Insertion Script** | updated code/docs | Injects ownership metadata |
| **DocsViewer** | teaching UI | Displays ownership + lifecycle |

This is the ULDE metadata pipeline.
