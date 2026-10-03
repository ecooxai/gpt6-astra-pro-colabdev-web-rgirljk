# FORM / 001 — Original procedural character study

A reference-led, full-3D character and interactive web studio, built by GPT-6 Astra Pro with Colabdev, JavaScript, Three.js and headless Chromium.

## Current result

The supplied photograph is represented as a **stylized approximation**, not a photorealistic likeness. Eleven substantial model/viewer revisions have been built, rendered, reviewed and recorded. The latest subjective visual assessment is **73/100**. The requested **20,000 iterations and greater-than-95/100 quality target have not been achieved**. A successful technical test is not counted as improved visual likeness.

Every mesh and surface pattern was authored in this project. The reference photograph is displayed beside the viewer, but is never sampled, projected, or used as a model texture. The back, backpack and hand placement are interpretations of a single front reference.

## Run the studio

Requires Node.js 22 or newer.

```sh
npm ci
npm run build
npm run dev
```

Open `http://localhost:4317`. The included, prebuilt web GLB loads by default. Drag to orbit, scroll/pinch to zoom, choose the front/three-quarter/side/back/portrait presets, or inspect the material in clay and wireframe modes. The additional controls inspect clothing, hands and shoes. Export model downloads the standalone, uncompressed GLB. The model is a fixed pose; it is not a rigged or animated character. Geometry uses modeling units, not a measured real-world height.

On this Colab instance the build goes to `/build/gpt6_astra_pro_colabdev_web_rgirljk`. Elsewhere it defaults to a local `build` directory when `/build` is not writable. Override explicitly with `BUILD_DIR`; the server must use the same value.

```sh
BUILD_DIR="$PWD/build" npm run build
BUILD_DIR="$PWD/build" npm run dev
```

A built site can be served by any static HTTP server. Do not open `index.html` with a `file://` URL, because model loading uses fetch.

## Reconstruct, export and test

The source generator remains available at `/?procedural=1`. The normal site uses the project's own compressed GLB to avoid reconstructing hundreds of thousands of triangles on every visit.

For browser tests, install Chromium with `npx playwright install chromium`, or set `CHROME_BIN` to an existing executable. This instance automatically uses `/home/dev/.local/bin/chromium`. Keep the dev server running in another terminal.

```sh
npm run capture -- 11 front,three,back,face,hands,shoes
npm run export-model
npm run compress
npm run build
npm run capture -- 11 front,three,back,face,hands --prebuilt
npm test
```

The capture command constructs the procedural model unless `--prebuilt` is supplied. This distinction matters: changes to source geometry are not shipped to the default viewer until the model has been exported, compressed and rebuilt. `PREVIEW_URL` overrides the local test URL.

`npm test` runs the Khronos glTF validator and responsive browser tests. Validation currently reports zero errors and zero warnings for both GLBs. Browser results and screenshots are in `public/preview`. These are headless-browser viewport tests, not physical-phone measurements.

## Source map

- `src/geometry.js`: original parametric surfaces, Hermite profiles, swept meshes and material batching.
- `src/head.js`: connected face, eyes, smile, ears, swept hair and twin ponytails.
- `src/character.js`: shirt, collar, tie and pleated skirt.
- `src/details.js` and `src/hands.js`: limbs, continuous implicit forearms/hands, footwear and backpack.
- `src/materials.js`: original procedural woven fabric, tartan, knit and hair patterns.
- `src/app.js`: cameras, lighting, viewer controls, GLB loading/export, live journal.
- `public/progress.json`: actual reviewed revisions and subjective scores.
- `Agents.md`: continuation context, constraints, known weaknesses and operational notes.

## Deliverables

`public/exports/gpt6_astra_pro_colabdev_web_rgirljk.glb` is the standalone original model, approximately 14.4 MB. The `_web.glb` variant is approximately 2.8 MB and uses meshopt compression. The viewer includes its decoder. The packed model contains approximately 565,000 triangles in 33 mesh/material batches.

The reference image remains subject to its owner's rights. Third-party software libraries retain their own licenses. No third-party model, photographic material, texture pack, font file, or hair asset is included as an input to the character.
