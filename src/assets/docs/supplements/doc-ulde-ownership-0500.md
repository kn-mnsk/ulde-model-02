#  empty ULDE ownership map scaffold

Here’s an empty but structurally correct ULDE ownership map scaffold you can drop into something like ulde/ownership/ownership-map.json and start populating.

```json
{
  "$meta": {
    "schemaVersion": "1.0.0",
    "description": "Complete JSON ownership map for all ULDE fields",
    "generatedBy": "manual-scaffold",
    "generatedAt": null
  },

  "stable": {
    /* Example placeholders – replace with real UldeArtifacts paths */

    "doc.id": {
      "path": "doc.id",
      "type": "string",
      "owner": "",
      "readers": [],
      "writers": [],
      "lifecycle": "stable",
      "description": "",
      "source": "",
      "constraints": {},
      "notes": ""
    },

    "doc.slug": {
      "path": "doc.slug",
      "type": "string",
      "owner": "",
      "readers": [],
      "writers": [],
      "lifecycle": "stable",
      "description": "",
      "source": "",
      "constraints": {},
      "notes": ""
    },

    "content": {
      "path": "content",
      "type": "string",
      "owner": "",
      "readers": [],
      "writers": [],
      "lifecycle": "stable",
      "description": "",
      "source": "",
      "constraints": {},
      "notes": ""
    },

    "toc[]": {
      "path": "toc[]",
      "type": "object",
      "owner": "",
      "readers": [],
      "writers": [],
      "lifecycle": "stable",
      "description": "",
      "source": "",
      "constraints": {},
      "notes": ""
    },

    "toc[].id": {
      "path": "toc[].id",
      "type": "string",
      "owner": "",
      "readers": [],
      "writers": [],
      "lifecycle": "stable",
      "description": "",
      "source": "",
      "constraints": {},
      "notes": ""
    },

    "links[]": {
      "path": "links[]",
      "type": "object",
      "owner": "",
      "readers": [],
      "writers": [],
      "lifecycle": "stable",
      "description": "",
      "source": "",
      "constraints": {},
      "notes": ""
    },

    "links[].href": {
      "path": "links[].href",
      "type": "string",
      "owner": "",
      "readers": [],
      "writers": [],
      "lifecycle": "stable",
      "description": "",
      "source": "",
      "constraints": {},
      "notes": ""
    }
  },

  "experimental": {
    /* Add experimental fields here, same shape as above */

    "flags.betaFeatures": {
      "path": "flags.betaFeatures",
      "type": "object",
      "owner": "",
      "readers": [],
      "writers": [],
      "lifecycle": "experimental",
      "description": "",
      "source": "",
      "constraints": {},
      "notes": ""
    }
  },

  "deprecated": {
    /* Add deprecated fields here, same shape as above */

    "metadata.legacyCategory": {
      "path": "metadata.legacyCategory",
      "type": "string",
      "owner": "",
      "readers": [],
      "writers": [],
      "lifecycle": "deprecated",
      "description": "",
      "source": "",
      "constraints": {},
      "replacement": "",
      "notes": ""
    }
  }
}

```

