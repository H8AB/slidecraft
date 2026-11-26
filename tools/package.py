"""Package two installable skill archives from tools/build.cjs outputs."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json, sys

root = Path(__file__).resolve().parents[1]
skill = root / "skills/slidecraft"
dest = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root / "dist"

def text_notices():
    locked = json.loads((skill/"package-lock.json").read_text())
    pieces = ["Bundled dependencies and third-party notices\n"]
    for key, item in locked["packages"].items():
        if not key or item.get("dev") or not (skill/key).exists():
            continue
        folder = skill/key
        pkg = json.loads((folder/"package.json").read_text())
        title = pkg["name"]+" "+pkg["version"]+" — "+str(pkg.get("license","see package"))
        pieces.extend([title, "Source package: "+item.get("resolved","")])
        for f in sorted(folder.iterdir()):
            if f.is_file() and f.name.lower().startswith(("licen","copying","copyright","notice")):
                pieces.append(f.read_text(errors="replace"))
    return "\n\n".join(pieces)

wb = """display_name: PPT 制作与视觉优化
display_name_en: Slidecraft
description_zh: 从材料制作可编辑 PPT，或按页面和对象优化已有演示稿。
description_en: Create editable PowerPoint decks or restyle existing slides.
examples_en:
  - Create a five-slide merchandising review from my brief.
  - Redesign this PowerPoint and preserve the original chart data.
examples_zh:
  - 根据简报制作五页商品运营复盘。
  - 优化这份演示稿并保留原始图表数据。
version: 0.2.0
author: Slidecraft contributors
"""
notice = text_notices()
(dest/"THIRD_PARTY_NOTICES.txt").write_text(notice)
page = dest/"slidecraft.html"
if page.exists():
    html = page.read_text()
    if 'id="third-party-notices"' not in html:
        html = html.replace("</html>", '<script type="text/plain" id="third-party-notices">'+notice.replace("</script", "<\\/script")+"</script></html>")
        page.write_text(html)
for platform in ["agent","workbuddy"]:
    entry=(skill/"SKILL.md").read_text()
    if platform=="workbuddy":
        entry=entry.replace("\n---\n# Slidecraft","\n"+wb+"---\n# Slidecraft",1)
    with ZipFile(dest/f"slidecraft-{platform}.zip","w",ZIP_DEFLATED) as z:
        z.writestr("slidecraft/SKILL.md",entry)
        for f in sorted((skill/"references").glob("*.md")):
            z.write(f,"slidecraft/references/"+f.name)
        z.write(dest/"run.cjs","slidecraft/scripts/run.cjs")
        z.write(root/"LICENSE","slidecraft/LICENSE")
        z.writestr("slidecraft/THIRD_PARTY_NOTICES.txt",notice)
