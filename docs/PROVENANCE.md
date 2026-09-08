# Source-to-view provenance

1. Original SceneFun3D research dataset, CVPR 2024.
2. Voxel51 Hugging Face conversion, revision `76803371aae67277cfa0cc29804db2368c6756ce`.
3. `data/421061.pcd` and `samples.json` fetched at the pinned revision.
4. Point-cloud SHA-256: `f368d72b10c95d5b72f9c0d86b20c514cd4ecfb133d539e3ec1f178c3e7d1a38`.
5. Decode little-endian binary fields. Interpret the RGB storage as packed bits.
6. Select 18,000 evenly spaced source row indices, first and last included.
7. Subtract one common origin from every spatial location. Preserve directions and dimensions.
8. Join annotation labels, boxes and task text by source annotation ID; create P01–P12 display IDs.
9. Browser projects these coordinates, highlights one annotation and displays source metadata.

The manifest includes the metadata checksum and original coordinate origin. The preparation notebook reproduces decoding, count checks, translation and metadata inspection. `scene.json` carries the full display sample. Rendered apparent size depends on view and zoom; no scale bar or world-unit claim is inferred from the display alone.

Graph edges are typed: scene **contains** part; part **has annotated affordance** label; part **has task description** text. No object hierarchy, physical execution or success probability is inferred.

Annotation semantics: the source label `exclude` marks insufficiently captured geometry and is omitted from source evaluation. It is not an affordance class. See the [original annotation documentation](https://scenefun3d.github.io/documentation/dataset/annotations/).
