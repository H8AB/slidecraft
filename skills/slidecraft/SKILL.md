---
name: slidecraft
description: Make editable PowerPoint presentations from a brief, or visually improve an existing PPTX. Use for slide creation, redesign, presentation polish, 制作PPT、优化PPT、排版美化、品牌改版 or before/after comparisons.
---
# Slidecraft · PPT 制作与视觉优化

根据用户材料、用途和交付要求，制作一份可以继续编辑的演示文稿。可用中文或英文工作。

## 从材料制作新稿

1. 确认受众、演示时长或页数、要做的决定。优先从材料推断；缺失且会实质影响结果时再问。根据内容选择封面、比较、趋势、数据表或行动页。每页先确定观众需要看懂的一个问题。
2. 列出每页标题、证据、单位、配图及来源。只用材料能支持的事实；将提案与观察区分。图表从原始数据生成。对有明确品牌规则、母版或参考稿的请求，优先使用它们。
3. 有合适的原生 PPT 工具时，可直接按上述设计制作。也可把材料写成 references/formats.md 中的 deck.json，运行下列命令。生成器提供六种页型；不适合这些版式的稿件可用宿主原生编辑能力。
4. 检查导出文件，依照下文验收。用户要求结果时交付实际文件。

## 优化已有 PPT

1. 读取原稿并查看各页渲染图。记录需保留的母版、页序、文字、数字、来源、页脚、备注、可编辑图表及嵌入对象。缺少渲染工具时先取得截图或 PDF。仅凭抽取文字无法判断图片裁切、溢出和视觉层级。
2. 先选最影响理解的改动。对每个候选页，写明具体问题和处理方法。例如“主图只占画面四分之一，放大原图并将版本名对齐图的中线”。有意重叠、装饰或故意留白无需统一消除。设计判断见 references/design.md。
3. 用 inspect 取得演示顺序、画布尺寸、对象编号和文字，按 references/formats.md 编制 plan.json。把原文件当成输入，输出到新路径。保留文字段落、数值与数据口径。修改图表位置用原生图表框；复杂页可交宿主编辑或保留并逐页说明。
4. 应用计划，重新渲染每一页并与原稿对照。修正裁切、非预期换行和对齐问题。只有请求范围包括改写或重组时才改变文案或页序。

## 文件执行

发布 ZIP 内置 scripts/run.cjs，执行需要 Node.js 18+，无需联网安装。源码仓库中在技能目录运行 npm ci 后可将下列 run.cjs 改为 slidecraft.cjs。命令的输入、输出都使用实际文件路径。

    node scripts/run.cjs create deck.json created.pptx
    node scripts/run.cjs inspect original.pptx > inventory.json
    node scripts/run.cjs apply original.pptx plan.json optimized.pptx

网页聊天里可读取本技能的操作准则。环境不能执行 PPTX 工具时，输出可导入配套本地网页的 deck.json 或 plan.json；设计反馈可以直接基于用户提供的截图给出。网页项目中的使用说明附在 Release 中。

## 验收与交付

- 在有中文字体的渲染器中逐页查看。检查标题换行、脚注、图表轴、图片纵横比及同一数据的不同表述。按投屏距离决定字号。
- 对修改稿，复核页数、顺序、原始文本、备注、图表数据与链接。支持核对的项目才标记为已验证。
- 提供可编辑文件。改版可附关键页前后对照。在说明中区分已完成、保留原状的复杂页和需要用户核对的部分。
