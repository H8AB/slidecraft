# File formats

[简体中文](formats.zh-CN.md)

## Slide outline: deck.json

Supply an ordered `slides` array. Each slide needs `kind` and `title`. Optional fields shared across slides include `section`, `subtitle` and `notes`. At the top level, `series` sets the header, `sourceMark` the footer, `font` the typeface and `lang` the presentation language (for example en-US or zh-CN).

- **cover** — Optional display number, caption and square image using `display`, `caption` and `asset`.
- **comparison** — One 2:1 image with two equal side-by-side photos in `asset`, plus two strings in `captions`.
- **metrics** — One to three items, each with a string `value` and `label`.
- **chart** — One to eight category strings in `labels` with corresponding numbers in `values`. Use `seriesName` for the legend or series label. For percentages, use fractional values and `numberFormat: "0.0%"`. Optional fields include `aside`, `asideLabel` and `note`.
- **table** — A rectangular array of strings in `rows`. The first row is the header. Include two to six rows and one to four columns. Supports the same aside and note fields as charts.
- **actions** — One to three items, each with a `label` and a `detail` string.

Use JPEG or PNG assets inside the outline directory and reference them by relative path. Check the actual rendering for long labels or paragraphs.

```json
{"series":"Merchandising","lang":"en-US","slides":[
  {"kind":"cover","title":"Search performance"},
  {"kind":"chart","title":"Click-through rate by image","seriesName":"CTR",
   "labels":["White background","Wardrobe"],"values":[0.036,0.045],"numberFormat":"0.0%"}
]}
```

## Object inventory and layout plan

Inspect the original presentation first. Each inventory lists slide order, canvas size and the top-level objects. Each object has an ID, name, kind, text and box. A box contains left, top, width and height in inches from the slide's upper-left corner. A null box indicates inherited positioning. Use renderings to decide which objects need work.

```json
{"source":"copy inventory.source here","slides":[
  {"slide":1,"background":"F7F4E9","objects":[
    {"id":"8","size":32,"color":"173E38","bold":true,"box":[0.7,1.2,9.8,0.8]}
  ]}
]}
```

Copy the actual fingerprint, slide number and object IDs from the input file. Colors have six hex digits and no hash. Sizes are in points. Styling affects ordinary text runs within the shape. Move a shape without changing its text style to preserve inline emphasis. Preserve image proportions. Use a native editor for changes to table rows or column widths.

The runner handles common Transitional PPTX files. Signed decks are inspect-only. Edits to slides with recognized animations, OLE, SmartArt relationships or compatibility branches are declined. Group members are not individually positioned. Review rotated or inherited shapes, media, overlays and vendor extensions in the original presentation app.
