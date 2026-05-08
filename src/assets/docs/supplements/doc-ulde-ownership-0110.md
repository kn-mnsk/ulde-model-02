# What the Auto‑Insertion Script Is

```
The auto‑insertion script is the glue between your plugins, your UldeArtifacts model, and your documentation system. It takes the canonical ownership map and injects ownership metadata into the places where humans and tools need it — without you ever touching those files manually again.

Below is the complete, structured explanation of the design, exactly aligned with your ULDE architecture.
```

A ULDE auto‑insertion script is a small code generator that:

- reads the complete JSON ownership map
- finds the corresponding fields in your codebase
- injects ownership metadata as JSDoc comments, Angular metadata, or Markdown tables
- preserves formatting
- is safe to run repeatedly
- never overwrites human‑written content

It is the “documentation compiler” for ULDE.

## 1. Why You Need It

Because ULDE is:

- plugin‑extensible
- lifecycle‑aware
- teaching‑friendly

…you need a single source of truth (the ownership map) and a mechanism to propagate that truth everywhere else.

The auto‑insertion script is that mechanism.

## 2. The Script’s Responsibilities

### 1. Read the canonical ownership map
  
It loads the JSON file that contains:

- field paths
- owners
- readers
- writers
- lifecycle
- descriptions

This is the input.

### 2. Locate the corresponding code artifacts

It scans:

- src/ulde-artifacts.ts
- plugin metadata files
- Angular DocsViewer metadata
- Markdown docs

It uses field paths like:

- content
- toc[].id
- links[].href

…to find the right insertion points.

### 3. Inject or update JSDoc comments

For example, it turns this:
```ts
content: string
```
into this:
```ts
/**
 * Owner: MarkdownPipeline
 * Readers: DocsViewer, SearchIndexPlugin
 * Writers: MarkdownPipeline
 * Lifecycle: stable
 */
content: string
```

### 4. Preserve formatting

- The script must:
- not remove blank lines
- not reorder fields
- not break indentation
- not rewrite the file

It only inserts or updates the comment block.

### 5. Be safe to run repeatedly

Running it twice should produce no diff.

This is the “idempotency” requirement.

### 6. Generate docs automatically

It can also output:

- Markdown tables
- plugin reference pages
- field reference pages
- lifecycle summaries

All derived from the same JSON map.

## 3. The Script’s Internal Architecture

### 1. Loader

Reads:
- the ownership map
- the target file(s)

### 2. Parser

Builds an AST of the TypeScript file so it can:

- find fields
- detect existing comments
- avoid breaking code

### 3. Matcher

Matches ownership map entries to AST nodes using:

- exact field names
- nested paths

- array element notation (toc[].id)

### 4. Comment Generator

Creates the JSDoc block from ownership metadata.

### 5. Inserter

Places the comment:

- above the field
- replacing old ownership comments
- preserving spacing

### 6. Writer

Writes the updated file back to disk.

## 4. Why This Script Matters in ULDE

__It enforces plugin discipline__

Plugins must declare:

- what they read
- what they write

If they don’t, the ownership map is incomplete and the script fails.

__It keeps documentation always correct__

No more stale docs.

No more guessing.

No more “tribal knowledge.”

__It makes ULDE teaching‑friendly__

- Beginners can see:
- who owns each field
- which plugin touches it
- what lifecycle it’s in

…directly in the code.

__It enables future tooling__

Because the ownership map is canonical, you can build:

- ownership conflict detectors
- plugin dependency graphs
- lifecycle migration tools
- visualizers

All powered by the same JSON.

## Summary of the Auto‑Insertion Script Design

| Component | Purpose |
| --- | --- |
| **Ownership Map Loader** | Reads the canonical JSON |
| **AST Parser** | Safely analyzes TypeScript files |
| **Field Matcher** | Maps JSON paths → code fields |
| **Comment Generator** | Builds ownership JSDoc blocks |
| **Inserter** | Injects comments without breaking formatting |
| **Writer** | Saves updated files |
| **Idempotency Layer** | Ensures repeated runs produce no diff |

__This is the exact design ULDE needs.__
