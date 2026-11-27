[English](README.md) · 简体中文

# Slidecraft · PPT 制作与视觉优化

## 先这样用

可以把简报、会议记录或现有 PPT 发给我，并说清听众和汇报场合。比如：“下周给团队汇报项目进展，帮我把这些材料做成 8 页以内的 PPT。”

我会先让你看到每页讲什么，再交付可编辑的 PPT。已有演示稿也可以直接说：“第三页太挤，帮我调一下，图表数据不要改。”

你只需要说希望改哪里；文件结构和生成步骤由我处理。公开案例只使用虚构或已公开的资料，分享前会检查备注与附件。

用业务材料制作可编辑的 PowerPoint，或打开已有 PPTX，调整画面后另存副本。既可作为 Codex、Claude 和 WorkBuddy 的技能使用，也可以下载单文件网页，直接在浏览器中操作。

**[使用指南](docs/使用指南.md)** · [下载离线网页版](downloads/slidecraft.html?raw=true) · [Codex / Claude 技能包](downloads/slidecraft-agent.zip?raw=true) · [WorkBuddy 技能包](downloads/slidecraft-workbuddy.zip?raw=true)

## 电商案例：收纳箱主图 A/B 测试

![收纳箱主图测试的封面，左侧为草稿，右侧为改版结果](examples/main-image-zh/cover-comparison.jpg)

同款收纳箱的白底图和衣柜场景图各获 20,000 次模拟曝光。场景图点击率为 4.5%，白底图为 3.6%，点击后的下单率均为 5.0%。五页演示稿保留可编辑的图表、订单表和演讲备注。品牌与数据为虚构，商品图为 AI 生成。

- **看制作**　[业务简报](examples/main-image-zh/brief.md) → [从零制作的五页 PPTX](examples/main-image-zh/01-created.pptx?raw=true)
- **看改版**　[运营草稿](examples/main-image-zh/02-before.pptx?raw=true) → [优化后 PPTX](examples/main-image-zh/03-optimized.pptx?raw=true) · [逐页对照图](examples/main-image-zh/comparison.jpg)
- **复现过程**　[制作大纲](examples/main-image-zh/deck.json) · [改版计划](examples/main-image-zh/plan.json) · [核验记录](examples/main-image-zh/核验记录.md) · [图片来源](examples/main-image-zh/assets/PROVENANCE.md)

## 第一次使用

下载并在桌面浏览器打开 **slidecraft.html**，在右上角选择「简体中文」。想制作新稿时，点击「载入电商案例」和「下载可编辑 PPTX」。想看改版时，切到「优化已有 PPT」，点击「试用电商改版案例」和「应用方案并下载副本」。两条流程都可离线使用。

智能体用户可按[安装步骤和示例提示词](docs/使用指南.md)添加对应 ZIP。使用你自己的 PPT 时，先让智能体读取对象清单和渲染图，制定针对该文件的排版方案。平台安装方式已按官方文档整理，实测范围包括分发包执行器、命令行、桌面 Chrome 和 LibreOffice 渲染。

## 支持范围与开发

支持制作封面、图片对照、指标、单系列图表、表格及行动页；优化已有稿时可调整背景、字号、颜色、粗细和原生对象的位置与大小。部分动画、嵌入对象和签名文件仅支持诊断。[文件接口与限制](skills/slidecraft/references/formats.zh-CN.md)

从仓库根目录运行以下命令可重新构建网页版、免 npm 安装的技能执行器及 ZIP。需要 Node.js 18+ 和 Python 3。

```sh
npm ci --prefix skills/slidecraft
node tools/build.cjs
python3 tools/package.py
```

构建产物位于 dist。项目代码采用 [MIT 许可](LICENSE)，发行包包含第三方依赖的许可声明。

平台文档：[Agent Skills 规范](https://agentskills.io/specification) · [OpenAI](https://learn.chatgpt.com/docs/build-skills) · [Claude Code](https://code.claude.com/docs/en/skills) · [Claude 网页](https://support.claude.com/en/articles/12512180-use-skills-in-claude) · [WorkBuddy](https://open.workbuddy.cn/en/docs/skill)
