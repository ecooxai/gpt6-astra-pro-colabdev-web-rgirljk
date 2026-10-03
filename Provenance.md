# Provenance

The character geometry and all visible surface patterns were authored in this project. No pre-existing character model, hair asset, texture pack, photographic skin material, or font file was used. The supplied photograph is a visual reference and UI comparison only; it is never projected onto the model or sampled by image-analysis code.

Parametric meshes, swept surfaces, and implicit hand/forearm fields are defined in src. Fabric and hair patterns are drawn procedurally on canvases by src/materials.js. The GLBs are exports of those original meshes and materials. The web GLB is a compressed version of the same model.

Three.js and its helper algorithms, esbuild, Playwright, meshoptimizer/gltfpack, and the Khronos glTF validator are software dependencies. Their licenses remain with their respective authors. The reference photograph remains subject to its owner's rights.

The back and hidden hand details are inferred from a single reference. The result is posed, not rigged. The visual score is subjective. The requested 20,000 iterations and above-95 quality goal remain unmet.
