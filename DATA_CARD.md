# Data card

## Actual 3D data

- Original: Alexandros Delitzas, Ayça Takmaz, Federico Tombari, Robert W. Sumner, Marc Pollefeys and Francis Engelmann (2024). *SceneFun3D: Fine-Grained Functionality and Affordance Understanding in 3D Scenes*. CVPR 2024. https://scenefun3d.github.io/
- Conversion: https://huggingface.co/datasets/Voxel51/SceneFun3D
- Revision: `76803371aae67277cfa0cc29804db2368c6756ce`.
- Scene: `421061`, training split. Source cloud: 1,966,804 points. Bundled sample: 18,000 evenly spaced source rows. Twelve source annotations retained: seven affordance labels and five exclude labels.
- License: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Attribution, noncommercial and share-alike conditions apply to data and adaptations.
- Transformations: decode PCD binary x/y/z plus packed RGB; sample deterministic indices; subtract the same bounding-box midpoint from points, part locations and motion origins; round display coordinates. No axis rotation, inference, relabeling or robot simulation.
- Fields: points are `[x,y,z,r,g,b]`; parts preserve source label, dimensions, rotation, task descriptions, motion fields and annotation ID. `short_id` is a teaching display label. See `dist/data/scene-manifest.json` for the common origin and checksums.
- Limitations: one training scene; not representative of all environments. Sampling may omit small functional surfaces. Source annotations may contain uncertainty; the demo does not assess their ground-truth quality. Do not infer physical feasibility, human identity or safe robot behavior.
- Student additions: keep visibility/ambiguity ratings separate, identify the protocol, and preserve disagreements. Link using the exact source ID. Do not present student judgments as original labels.

## Constructed network

`network.json` and `edges.csv` describe a binary undirected eight-node graph with eleven edges and no self-loops. Nodes stand for Claim, Paper, Code, Dataset, License, Model, Evaluation and User task. Edges mean a documented dependency **in a toy example**; they do not describe a real publication, causal relation or transaction. This teaching graph is released with the repository’s MIT code license.

## Governance questions

Who produced the source, under what conditions, and for what purpose? Are reuse terms compatible with the proposed publication? Which fields are source evidence and which are interpretations? Is one scene enough for the claim? Can a peer trace the transform? Relevant readings: Wilkinson et al. (2016), FAIR, https://doi.org/10.1038/sdata.2016.18 ; Gebru et al. (2021), Datasheets for Datasets, https://doi.org/10.1145/3458723 .

Annotation semantics: the source label `exclude` marks insufficiently captured geometry and is omitted from source evaluation. It is not an affordance class. See the [original annotation documentation](https://scenefun3d.github.io/documentation/dataset/annotations/).
