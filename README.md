# Evidence in Space — INFOSCI 301 Week 3

A small, inspectable template for network visualization and information ethics for emerging technology. It includes a **real 3D SceneFun3D extract**, linked source annotations (including clearly identified exclusions), a constructed network/matrix comparison, a BFS spanning tree, and Python/R notebooks.

## Run

From this repository folder:

```sh
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`. Alternatively, with Node.js 20 or later, run `npm run dev`. No package download, AI key, server-side inference, cloud GPU or database is required. Use an HTTP server; opening index.html directly with `file://` will not load JSON.

## What is implemented

- Orbit/zoom a real 18,000-point extract; select among 12 source annotations (7 affordance, 5 exclude).
- Inspect source labels, task descriptions, centered part locations, boxes and motion annotations.
- Follow scene → part → annotated affordance and part → task-description relationships.
- Switch a constructed eight-node graph among node–link, matrix and BFS-tree views.
- Use keyboard controls, the accessible annotation table, JSON/CSV downloads and a static network figure.
- Download three notebooks from the studio tab.

The renderer uses dependency-free Canvas projection of actual 3D coordinates. The box and axis are annotations, not a simulation or robot trajectory. The source rotations in this selected extract are zero; the validator enforces that assumption. There is no policy model, mesh reconstruction, physical control or fabricated robot motion.

## Deploy

The instructor creates the actual GitHub organization and repository during class. After uploading this folder, enable **Template repository** in GitHub Settings. Generate real links:

```sh
python3 scripts/configure_release.py --repo https://github.com/OWNER/REPOSITORY
```

Replace the destination with the repository you created. The generated `DEPLOY_LINKS.md` contains a Vercel button and Python Colab links. Commit that file. The browser’s **Deploy your copy** page can also generate the Vercel link. A deploy button starts a provider setup flow; authentication and project creation are still required.

Vercel configuration is supplied: static/Other framework, `dist` output, `npm run build` validation. Hobby is for eligible personal, noncommercial use and has limits; confirm suitability for the course’s deployment. The supplied GitHub Pages workflow is an alternative: select **GitHub Actions** as Pages source, then run it on the public repository. No repository or external deployment was created by this file release.

## Teaching sequence

1. Predict graph properties before running the notebook; compare two idioms on the same task.
2. Present already-submitted Reflection II in the evidence workshop.
3. Observe a source 3D annotation and state what it does and does not establish.
4. Add a documented visibility/ambiguity table; preserve student judgments separately.
5. Propose, verify and disclose AI-assisted development changes.
6. Carry one insight into the individual formal IEEE VIS redesign.

There is **no Weekly Reflection III**. The formal project requires a published IEEE VIS paper from 2024–2026, four-level validation critique, literature-supported open science/data governance, **additional data AND emerging technology**, and a scoped prototype/evaluation. SceneFun3D is a CVPR practice dataset, not an eligible primary IEEE VIS paper.

## Data and license

See [DATA_CARD.md](DATA_CARD.md), [docs/PROVENANCE.md](docs/PROVENANCE.md), and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Original creators: Delitzas et al., SceneFun3D, CVPR 2024. Hugging Face conversion: Voxel51/SceneFun3D, pinned revision `76803371aae67277cfa0cc29804db2368c6756ce`, scene 421061. Data and adaptations are **CC BY-NC-SA 4.0**. This is publicly available data with conditions, not unrestricted open source. New repository code is MIT; it does not relicense the data.

## Reproduce and check

```sh
npm run check
```

The check covers graph invariants, finite 3D coordinates, source box assumptions, annotation IDs, local links and notebook structure. Both Python notebooks were executed successfully in the release environment with NumPy and Matplotlib. The complete R notebook uses base R and is intentionally unexecuted because a native R kernel was unavailable. Run it in the class R/IRkernel environment. Browser interaction and the external deployed destination must be checked in the instructor’s selected environment; the release browser connection was unavailable.

`notebooks/INFOSCI301_Week3_EmbodiedAI_Data_Preparation.ipynb` reproduces the extract from the pinned source (about 31.5 MB download). The web demo already bundles the small extract. See [docs/AI_ASSISTANCE.md](docs/AI_ASSISTANCE.md) for the human verification record and prompts.

## Structure

| Path | Purpose |
|---|---|
| `dist/` | Complete static site, data and notebook downloads |
| `notebooks/` | Editable source notebooks |
| `scripts/` | Local server, validation and real-link generation |
| `docs/` | Provenance, governance, AI and contributor guidance |
| `.github/` | Review templates and optional Pages workflow |

Documentation consulted: [GitHub template repositories](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository), [Vercel Deploy Button](https://vercel.com/docs/deploy-button), [Vercel Hobby](https://vercel.com/docs/plans/hobby), [OpenAI model guide](https://developers.openai.com/api/docs/guides/latest-model). Accessed 8 September 2026.

Annotation semantics: the source label `exclude` marks insufficiently captured geometry and is omitted from source evaluation. It is not an affordance class. See the [original annotation documentation](https://scenefun3d.github.io/documentation/dataset/annotations/).
