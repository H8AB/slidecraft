# Using Slidecraft

[Project home](../README.md) · [简体中文](使用指南.md)

## Try the offline editor

1. Download [slidecraft.html](../downloads/slidecraft.html?raw=true) and open the saved file in a desktop browser. On a GitHub file page, use **Download raw file**. English opens by default. The language menu in the header also offers Simplified Chinese.
2. Select **Create a deck → Load the ecommerce example → Download editable PPTX**. In the downloaded deck, slide 3 has an editable chart and slide 4 has a native PowerPoint table.
3. Select **Restyle a deck → Try the ecommerce redesign → Apply plan and download a copy**. This loads the draft and the layout plan that belongs to it. [See what changed on each slide](../examples/main-image/comparison.jpg).
4. For a new presentation, use the first line of the outline for the cover title. Start each new slide with `##` and add one to three `Label | Detail` lines. For images, tables or charts, use the [JSON outline format](../skills/slidecraft/references/formats.md). Select any image files named in your outline, then download the deck.

The editor processes files in your browser. It can run offline. Changing the interface language preserves a custom outline and an imported presentation. Loading an example uses the currently selected language.

## Install the agent skill

| Host | Package | Installation |
| --- | --- | --- |
| Codex | [Agent ZIP](../downloads/slidecraft-agent.zip?raw=true) | Extract the inner slidecraft folder into the project's .agents/skills/ directory. Invoke `$slidecraft` in that project. |
| Claude Code | [Agent ZIP](../downloads/slidecraft-agent.zip?raw=true) | Extract the same folder into .claude/skills/. Open the project and invoke `/slidecraft`. |
| Claude on the web | [Agent ZIP](../downloads/slidecraft-agent.zip?raw=true) | In an account that supports custom skills, upload the ZIP under Customize → Skills and enable it. Creating a PPTX also requires file execution in the session. |
| WorkBuddy | [WorkBuddy ZIP](../downloads/slidecraft-workbuddy.zip?raw=true) | Open skill management, add a local skill package, import the ZIP and select Slidecraft in a conversation. |
| Other web assistants | [Browser editor](../downloads/slidecraft.html?raw=true) | Send the assistant the format reference, a brief or slide previews. Paste its outline or edit plan into the local editor. [Example prompts](../web/web-assistants.md) |

The extracted entry point is `slidecraft/SKILL.md`. The bundled file runner needs Node.js 18 or later. It includes its dependencies. The browser editor works without Node.js. Host language settings control localized catalog fields. Live installation in every host and account has not been verified.

## Example prompts

**Create a deck**
“Use Slidecraft to make a five-slide PowerPoint for our merchandising review. Show both listing photos, compare clicks and orders, and finish with the next test. Keep the chart and table editable. Use the supplied data and state the attribution window.”

Use the [brief](../examples/main-image/brief.md) and the [product image pair](../examples/main-image/assets/main-image-pair.jpg) to try this prompt.

**Restyle a deck**
“Restyle this presentation for a five-minute team review. Make the click-through difference easy to find and keep the supporting numbers visible. Preserve the text, slide order, chart data and notes. Return a new PPTX and a before-and-after comparison.”

Try it with the [draft presentation](../examples/main-image/02-before.pptx?raw=true). An edit plan is tied to a specific input file. For your own deck, import the original, download its inventory, and send that inventory and slide previews to your assistant. Import the resulting plan and download a copy.

## Run the example from source

From the repository root:

```sh
npm ci --prefix skills/slidecraft
node skills/slidecraft/scripts/slidecraft.cjs create examples/main-image/deck.json created.pptx
node skills/slidecraft/scripts/slidecraft.cjs inspect examples/main-image/02-before.pptx > inventory.json
node skills/slidecraft/scripts/slidecraft.cjs apply examples/main-image/02-before.pptx examples/main-image/plan.json restyled.pptx
```

Use new output filenames each time. With an installed skill ZIP, use its `scripts/run.cjs` with the same commands and arguments. Open the result in your presentation app to check font substitution, wrapping, chart labels and speaker notes. [Example verification notes](../examples/main-image/verification.md)
