# how the auto‑insertion script updates ulde-artifacts.ts

```
Here is the deep, precise, ULDE‑accurate walkthrough of how the auto‑insertion script updates ulde-artifacts.ts, including:

- how it reads the ownership map
- how it finds the correct field
- how it generates the JSDoc block
- how it inserts it without breaking formatting
- how it stays idempotent
- how it integrates with the rest of the ULDE metadata pipeline

Every section includes Guided Links so you can explore any part of the architecture.
```

### __What the Script Is Actually Doing__

The auto‑insertion script takes the canonical ownership map from:

__ownership-map.json__

and injects ownership metadata directly into:
```
src/ulde/ulde-artifacts.ts
```

It updates only the JSDoc comments above each field — never the field definitions themselves.

This makes ULDE:

- self‑documenting
- plugin‑transparent
- teaching‑friendly
- always up‑to‑date

## Step 1 — Script Loads the Ownership Map

The script reads the canonical JSON produced by the registry:
```ts
const ownershipMap = JSON.parse(fs.readFileSync("ownership-map.json", "utf8"))
```

This map contains entries like:
```json
"toc[].id": {
  "owner": "TOCPlugin",
  "readers": ["SearchIndexPlugin"],
  "writers": ["TOCPlugin"],
  "lifecycle": "stable"
}
```

This is the source of truth.


## Step 2 — Script Parses ulde-artifacts.ts (AST)

The script uses a TypeScript AST parser to locate:

- interface fields
- nested fields
- array element fields
- union types
- optional fields

It builds a tree of:

- field names
- their positions in the file
- existing JSDoc blocks

This is the field matcher stage.

See: __[Explain DocsViewer field path computation]()__  
(The script uses the same canonical path rules.)

## Step 3 — Script Computes the Canonical Field Path

For each field in UldeArtifacts, the script computes the canonical path:
| Code | Canonical Path |
| --- | --- |
| ``toc: ``TocEntry[]`` | ``toc[]`` |
| ``toc: ``{ ``id: ``string ``}[]`` | ``toc[].id`` |
| ``links: ``LinkEntry[]`` | ``links[]`` |
| ``links[].href: ``string`` | ``links[].href`` |
| ``content: ``string`` | ``content`` |

This must match the ownership map exactly.

If the script cannot compute a path, it logs a warning.

## Step 4 — Script Generates the Ownership JSDoc Block

For each field, the script generates a JSDoc block like:
```ts
/**
 * Owner: TOCPlugin
 * Readers: SearchIndexPlugin
 * Writers: TOCPlugin
 * Lifecycle: stable
 */
```

This is built from:

- owner
- readers
- writers
- lifecycle
- description (optional)
- constraints (optional)

This is the comment generator stage.

See: [Explain ULDE auto‑insertion script design]()


## Step 5 — Script Inserts or Updates the Comment

The script:

- finds the field’s AST node
- checks if a JSDoc block already exists
- replaces only the ownership block
- preserves indentation
- preserves blank lines
- preserves formatting

Example transformation:

__Before__
```ts
toc: TocEntry[]
```
__After__
```ts
/**
 * Owner: TOCPlugin
 * Readers: DocsViewer, SearchIndexPlugin
 * Writers: TOCPlugin
 * Lifecycle: stable
 */
toc: TocEntry[]
```

This is the insertion layer.


## Step 6 — Script Ensures Idempotency

Running the script twice must produce no diff.

To guarantee this:

- it normalizes whitespace
- it normalizes ordering of readers/writers
- it normalizes lifecycle casing
- it replaces only the ownership block
- it never duplicates comments

This is the idempotency layer.


## Step 7 — Script Writes the Updated File

The script writes the updated file back to disk:
```
src/ulde/ulde-artifacts.ts
```

This file now contains:

- accurate ownership metadata
- lifecycle tags
- plugin read/write surfaces

This is the final output of the pipeline.


# End‑to‑End Flow (Textual Diagram)

```
ownership-map.json
      ↓
Auto‑Insertion Script
      ↓ load + parse + match
AST of ulde-artifacts.ts
      ↓ generate JSDoc
Updated ulde-artifacts.ts
      ↓ consumed by
Angular DocsViewer
```

This is the ULDE metadata pipeline.

# Why This Matters

✔ __ULDE becomes self‑documenting__
Developers see ownership metadata directly in the code.

✔ __Plugins become transparent__
No hidden behavior. No undocumented field access.

✔ __DocsViewer becomes teaching‑friendly__
Ownership metadata appears in the UI.

✔ __Tooling becomes possible__

You can build:

- ownership conflict detectors
- plugin dependency graphs
- lifecycle migration tools

All powered by the same JSON.
