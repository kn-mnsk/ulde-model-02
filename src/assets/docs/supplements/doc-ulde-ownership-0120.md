# What the ULDE Ownership Registry is

```
The ULDE Ownership Registry is the central coordinator that merges all plugin‑level ownership declarations into the single canonical ownership map your auto‑insertion script and teaching tools depend on.
It is one of the most important architectural pieces in ULDE because it connects plugin metadata, UldeArtifacts, and the final ownership map.

Below is the complete, structured explanation of what it is, why it exists, and how it works inside your model ULDE project.
```

## 1. What the ULDE Ownership Registry is

The ULDE Ownership Registry is a small subsystem that:

- collects ownership contributions from every plugin
- validates them
- detects conflicts
- merges them into one canonical map
- outputs the final JSON file used by your auto‑insertion script

It is the aggregation layer between:

- plugin‑centric metadata (Thread 1)
- field‑centric ownership map (Thread 2)

## 2. Why ULDE Needs an Ownership Registry

### 1. Plugins declare ownership independently

Each plugin declares:

- which fields it owns
- which fields it reads
- which fields it writes
- lifecycle metadata

But ULDE needs one unified map.

### 2. ULDE must detect conflicts

If two plugins claim ownership of the same field, ULDE must:

- detect it
- fail the build
- show a clear error

This prevents silent corruption.

### 3. ULDE must produce a canonical JSON file

Your auto‑insertion script, Angular DocsViewer, and teaching tools all depend on:

- one file
- sorted
- validated
- complete

The registry produces that file.

### 4. ULDE must remain plugin‑extensible

New plugins can be added without modifying core code.

The registry makes this possible.

## 3. What the Registry Contains

### 1. A list of contributors

Each plugin exports a UldeOwnershipContributor:

- pluginName
- contributeOwnership()

The registry collects these.

### 2. A merge engine

This engine:

- merges all contributions
- checks for duplicate field paths
- checks for invalid lifecycle phases
- checks for missing required metadata

### 3. A final ownership map

This is the canonical artifact:

- sorted by lifecycle
- complete
- ready for auto‑insertion
- ready for docs generation

## 4. How the Registry Works (Step‑by‑Step)

### 1. Plugins register themselves

Each plugin exports a contributor object:
```ts
export const TocPluginOwnership = {
  pluginName: "TOCPlugin",
  contributeOwnership() {
    return {
      "toc": { … },
      "toc[].id": { … }
    }
  }
}
```
The registry collects these.

### 2. Registry loads all contributors

The registry is initialized with a list of contributors:
```ts
const registry = new UldeOwnershipRegistry([
  UldeCoreOwnership,
  TocPluginOwnership,
  LinkResolutionOwnership,
  // …
])
```

### 3. Registry merges contributions

For each contributor:

- call contributeOwnership()
- iterate through each field path
- check for conflicts
- insert into the map

If a conflict occurs:

> __Error: Ownership conflict on field "toc[].id" between TOCPlugin and AnotherPlugin__

This is intentional — ULDE must be strict.

### 4. Registry validates the final map

Validation includes:

- required fields (owner, type, lifecycle)
- valid lifecycle (stable, experimental, deprecated)
- valid permissions
- valid field paths

Invalid entries fail the build.

### 5. Registry emits the final JSON

The registry writes:

```
/ulde/ownership/ownership-map.json
```

- This file is:
- canonical
- lifecycle‑sorted
- complete

ready for your auto‑insertion script

### 6. How the Registry Fits Into Your Model ULDE Project

### 1. It lives under /ulde/ownership/

Your project structure:
```
/ulde/
  ownership/
    ownership-map.json
    ownership-schema.json
    ownership-registry.ts
```

### 2. It runs during the build

The build pipeline:

1. Load contributors
2. Merge
3. Validate
4. Emit JSON
5. Auto‑insertion script runs
6. DocsViewer consumes metadata

### 3. It is the bridge between plugins and documentation

Plugins → Registry → Ownership Map → Auto‑Insertion → DocsViewer

This is the ULDE metadata pipeline.

# Summary: What the Ownership Registry Does

| Function | Purpose |
| --- | --- |
| **Collects plugin ownership metadata** | Plugin‑centric → field‑centric |
| **Detects conflicts** | Prevents ambiguous ownership |
| **Validates metadata** | Ensures correctness |
| **Merges contributions** | Produces one canonical map |
| **Emits JSON** | Used by auto‑insertion + docs |
| **Supports teaching** | Makes plugin behavior explicit |

The registry is the central nervous system of ULDE’s ownership model.
