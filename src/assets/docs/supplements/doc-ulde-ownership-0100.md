# Ownership Map
```
The ownership map becomes a first‑class subsystem inside your model ULDE project — not a side document, not a teaching aid, but a core artifact that the engine, plugins, and tooling all depend on.

Here is the clear, structured explanation of how it fits into your model ULDE project, step by step, with the exact architectural roles it plays.
```

## 1. It becomes a core artifact inside /ulde/ownership/

The ownership map lives in your project as:

```code
/ulde/
  ownership/
    ownership-map.json        ← the canonical file
    ownership-schema.json     ← JSON Schema for validation
    ownership-registry.ts     ← merges plugin contributions
```

This is the single source of truth for:

- field definitions
- lifecycle phases
- plugin read/write surfaces
- ownership metadata

Everything else in ULDE reads from this.

## 2. It powers your auto‑insertion script

Your script (the one you mentioned earlier) will read:

- the canonical JSON file
- the plugin declarations
- the lifecycle metadata

…and automatically inject ownership info into:

- generated docs
- plugin reference pages
- field reference tables
- Angular DocsViewer metadata

This is why the JSON must be:

- machine‑readable
- lifecycle‑sorted
- complete
- canonical

This is exactly what the [auto‑insertion script (Id:doc-ulde-ownership-0110)](#docId:doc-ulde-ownership-0110 "What the Auto-Insersion Script is") consumes.


## 3. It becomes the bridge between the two threads

This is the key architectural connection:

__Thread 1 (Teaching‑Friendly Plugin Options)__

- Plugins declare:
- what they read
- what they write

what lifecycle they operate in

__Thread 2 (Complete JSON Ownership Map)__

ULDE aggregates all plugin declarations into:

- one canonical JSON file
- sorted by lifecycle
- with every field exactly once

This is done by the [ownership registry (Id:doc-ulde-ownership-01200](#docId:doc-ulde-ownership-01200 "What the Ownership Registry is") inside your model project.

## 4. It becomes part of the build pipeline

During your model ULDE build:

1. Plugins contribute ownership metadata
2. The registry merges them
3. The merged map is validated
4. The final JSON file is emitted
5. Docs + Angular adapters consume it

This is why the ownership map must be:

- deterministic
- conflict‑free
- validated
- stable

The build will fail if two plugins claim the same field.

## 5. It becomes the source of truth for Angular DocsViewer

Your Angular viewer will use the ownership map to:

- show field ownership badges
- highlight lifecycle phases
- show plugin read/write surfaces
- generate field reference tables
- show “owned by X plugin” tooltips

This is powered by the [ownership metadata integration (Id:doc-ulde-ownership-01300)](#docId:doc-ulde-ownership-01300 "What “Integrating Ownership Metadata into Angular DocsViewer” Means").

##  6. It becomes the foundation for future ULDE tooling

Once the ownership map exists, you can build:

- ownership conflict detector
- plugin profiler
- field‑level dependency graph
- lifecycle migration assistant
- plugin capability visualizer

All of these rely on the canonical JSON file.

## 6. It becomes the foundation for future ULDE tooling

Once the ownership map exists, you can build:

- ownership conflict detector
- plugin profiler
- field‑level dependency graph
- lifecycle migration assistant
- lugin capability visualizer

All of these rely on the canonical JSON file.

## 7. It becomes the contract for plugin authors

When someone writes a plugin, they must declare:

- which fields they read
- which fields they write
- which lifecycle they operate in

ULDE merges this into the ownership map.

This ensures:
- no hidden behavior
- no undocumented field access
- no accidental collisions
- predictable plugin interactions

This is the heart of ULDE’s teaching‑friendly design.

## Summary: How it fits into your model ULDE project

| Layer | Role of the Ownership Map |
| --- | --- |
| **Core Engine** | Canonical field definitions + lifecycle |
| **Plugins** | Declare read/write surfaces → merged into map |
| **Build Pipeline** | Validates + emits final ownership JSON |
| **Auto‑Insertion Script** | Injects ownership info into docs |
| **Angular DocsViewer** | Displays ownership + lifecycle metadata |
| **Teaching Layer** | Explains plugin behavior using the map |
| **Future Tooling** | Conflict detection, profiling, visualization |

The ownership map becomes the central nervous system of your model ULDE project.
