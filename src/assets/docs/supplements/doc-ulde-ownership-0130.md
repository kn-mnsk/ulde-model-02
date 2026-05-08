# Integrate ownership metadata into Angular DocsViewer

```
Integrating ownership metadata into your Angular DocsViewer is one of the most important steps in making ULDE teaching‑friendly, self‑documenting, and plugin‑transparent.
This is where the canonical ownership map (Thread 2) becomes visible inside the DocsViewer UI (Thread 1).

Below is the complete, structured, ULDE‑aligned explanation of how this integration works.
```
## 1. What “Integrating Ownership Metadata into Angular DocsViewer” Means

It means your Angular DocsViewer will:

- read the canonical ownership map JSON
- attach ownership metadata to each rendered field
- display ownership badges, lifecycle tags, and plugin read/write surfaces
- show tooltips or side panels explaining which plugin touches what
- help contributors understand ULDE’s architecture while reading docs

This transforms DocsViewer from a passive renderer into an interactive teaching tool.

## 2. The Integration Has 4 Architectural Layers

### 1. Ownership Map Loader (Angular Service)

DocsViewer needs a service that loads the ownership map at runtime or build time.

Example shape:
```ts
@Injectable({ providedIn: 'root' })
export class OwnershipService {
  private ownership = signal<UldeOwnershipMap>({})

  load(map: UldeOwnershipMap) {
    this.ownership.set(map)
  }

  get(path: string) {
    return this.ownership()[path]
  }
}
```

This service becomes the bridge between the JSON file and the UI.

### 2. Field‑Level Ownership Lookup

When DocsViewer renders a field (e.g., toc[].id, content, links[].href), it must:

- compute the canonical field path
- ask the OwnershipService for metadata
- attach that metadata to the rendered node

This is where your existing DocsViewerComponent integrates ownership.

Example:
```ts
const meta = this.ownershipService.get(fieldPath)
```

This metadata includes:

- owner
- readers
- writers
- lifecycle
- description

### 3. UI Rendering: Ownership Badges + Lifecycle Tags

DocsViewer should display ownership metadata visually.

Example UI elements:
- Owner badge  
“Owned by: MarkdownPipeline”

- Lifecycle tag  
“stable”, “experimental”, “deprecated”

- Read/Write surfaces  
“Read by: SearchIndexPlugin” <br>
“Written by: TOCPlugin”

- Tooltip  
Hovering over a field shows plugin interactions.

Angular template example:
```html
<div class="field-header">
  <span class="owner-badge">{{ meta.owner }}</span>
  <span class="lifecycle-tag">{{ meta.lifecycle }}</span>
</div>

@if (meta.readers.length > 0) {
  <div class="rw">
    <span>Reads: {{ meta.readers.join(', ') }}</span>
  </div>
}

@if (meta.writers.length > 0) {
  <div class="rw">
    <span>Writes: {{ meta.writers.join(', ') }}</span>
  </div>
}
```

This makes ownership visible and intuitive.

### 4. Teaching‑Friendly Side Panel (Optional but Powerful)

DocsViewer can include a right‑side panel that shows:

- field description
- plugin interactions
- lifecycle phase
- source plugin
- constraints
- links to plugin docs

This is where the Teaching‑Friendly Plugin Options thread connects directly to the UI.

### 5. How Ownership Metadata Flows Through the System

#### 1. Plugins declare ownership
(Teaching‑Friendly Plugin Options)

#### 2. Ownership Registry merges declarations
(Ownership Registry)

#### 3. Canonical JSON ownership map is generated
(Thread 2)

#### 4. Angular DocsViewer loads the map
(OwnershipService)

#### 5. DocsViewer renders ownership metadata
(Badges, tooltips, side panels)

This is the ULDE metadata pipeline.

### 6. Why This Integration Matters

#### 1. Makes ULDE self‑documenting
Anyone reading docs can instantly see:

- who owns a field
- which plugin touches it
- what lifecycle it’s in

#### 2. Makes ULDE teaching‑friendly

New contributors learn ULDE by using ULDE.

#### 3. Prevents plugin misuse

If a plugin tries to read a field it shouldn’t, the UI makes it obvious.

#### 4. Enables future tooling

Ownership metadata in the UI unlocks:

- plugin dependency graphs
- lifecycle migration warnings
- plugin profiling overlays


# Summary: What You Just Added to ULDE

| Layer | Role |
| --- | --- |
| **Ownership Map** | Canonical metadata |
| **OwnershipService** | Loads metadata into Angular |
| **DocsViewer** | Displays ownership + lifecycle |
| **Teaching Layer** | Makes plugin behavior visible |
| **Future Tooling** | Profiling, graphs, warnings |

This is how ULDE becomes a transparent, teaching‑friendly, plugin‑extensible documentation engine.
