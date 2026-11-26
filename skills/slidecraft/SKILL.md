---
name: slidecraft
description: Create editable PowerPoint presentations from a brief or visually improve an existing PPTX. Use for slide creation, layout, redesign and before-and-after comparisons.
---
# Slidecraft

Use the language requested for the presentation. For existing decks, preserve the source language unless the user requests translation. Use English when creating sample material without a language preference. Simplified Chinese is available.

## Create a presentation

Infer the audience, the decision they need to make, and the available presentation time from the brief. Select a purpose and supporting evidence for each slide. Preserve units, time windows, source credits and the distinction between observations and proposals. Use the supplied brand or slide master when requested.

Use the host's slide editor if it suits the material, or write a deck.json following [the format reference](references/formats.md). The local generator supports covers, image comparisons, metrics, charts, tables and actions. Deliver the editable file and review the rendered slides.

## Restyle a presentation

Read the original and inspect slide previews. Record what must be preserved, including slide order, titles, brand elements, notes, charts and embedded objects. If rendering is unavailable, use supplied screenshots or a PDF to judge cropping, wrapping and alignment.

Prioritize changes that improve reading. For each change, identify the object, the issue and the intended result. Use [design guidance](references/design.md) when deciding what to emphasize. Keep intentional overlap and grouping. Apply chart changes to the native chart object.

Run inspect to get slide order, size, shape IDs, text and positions. Write an edit plan for that input only and apply it to a new file. Render the new file and compare every changed page with the original. Check the facts, chart values, slide count, notes, text fit and editability. Tell the user which complex slides were retained or still need inspection.

## File commands

The release ZIP contains scripts/run.cjs and its dependencies. Node.js 18 or later is required. In the source checkout, install the skill's npm dependencies and use scripts/slidecraft.cjs instead.

    node scripts/run.cjs create deck.json created.pptx
    node scripts/run.cjs inspect original.pptx > inventory.json
    node scripts/run.cjs apply original.pptx plan.json restyled.pptx

If file execution is unavailable, provide an outline or plan compatible with the offline browser editor. Distinguish that handoff from delivering an edited deck.

Chinese references: [设计说明](references/design.zh-CN.md) · [文件接口](references/formats.zh-CN.md).
