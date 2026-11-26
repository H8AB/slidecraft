# 文件接口 v0.1

## deck.json
顶层 slides 为有序页数组。series 是页眉品牌，sourceMark 是可见来源或标识，font 是可选字体。每页需要 kind 和 title，可填 section、subtitle、notes。图表支持一组 1 至 8 个数值；长句与多行内容需根据渲染结果调整。
- cover：可选 display、caption、asset。asset 指向正方形图片。
- comparison：asset 指向宽高比 2:1 的左右商品对照图；captions 是两个标签。
- metrics：items 为 1–3 个 {"value":"96","label":"平均人次"}。
- chart：labels 是类别数组，values 是等长数值数组；seriesName 为系列名。百分比传小数并指定 numberFormat 为 "0.0%"。可用 aside、asideLabel、note 添加解释。
- table：rows 为字符串二维数组，首行为表头，2–6 行，1–4 列；也可使用 aside、asideLabel、note。
- actions：items 为 1–3 个 {"label":"责任人","detail":"行动说明"}。
- 本地图片使用大纲目录内的相对路径，支持 PNG 与 JPEG。源码仓库 examples/main-image 提供完整五页样例。

    {"series":"商家运营","sourceMark":"示例","slides":[
      {"kind":"cover","title":"上新复盘","subtitle":"新品搜索表现"},
      {"kind":"chart","title":"两个版本的点击率","seriesName":"点击率",
       "labels":["A","B"],"values":[0.036,0.045],"numberFormat":"0.0%"}
    ]}

## inventory.json → plan.json
inspect 使用演示文稿中的实际页序。每个对象含 id、name、kind、text 和 box。坐标单位是英寸，顺序为 [左,上,宽,高]，原点在左上。null 表示位置继承自版式。图表、表格与图片是原生对象，组合内对象不提供单独定位。inventory 用于定位，仍需查看渲染图才能确立方案。

    {"source":"复制本次 inventory.source","slides":[
      {"slide":1,"background":"F7F4E9","objects":[
        {"id":"8","size":32,"color":"173E38","bold":true,"box":[0.7,1.2,9.8,0.8]}
      ]}
    ]}

source 是输入文件指纹，用于防止将一版文稿的方案意外套到另一版。只列入确需修改的页和对象。背景和色值均为无井号的 6 位十六进制。size 单位为 pt。文字样式作用于该形状内所有普通文字 run；含有特殊单字强调的对象优先只移动。既有表格宜平移，改变列宽或行高应使用原生表格编辑器。原图需按比例缩放。

支持普通 Transitional .pptx。带数字签名的文件只诊断；含动画、OLE、SmartArt 关系或兼容性分支的页面会跳过自动标题建议，并拒绝该页修改。检查不涵盖所有厂商扩展。无布局位置、旋转、继承色、重叠装饰、嵌入媒体等情况需人工判断。脚本只处理常见文本、位置及页背景，不负责渲染或识别文字溢出。
