# draw.io XML 提示词指南

这份文档用于给大模型生成 `draw.io` / `diagrams.net` 图时提供更稳定的提示词约束。目标不是让模型“会说 draw.io”，而是让它稳定地产出当前扩展可直接注入的、可解析的 `mxGraphModel XML`。

## 1. 结论先行

对当前项目来说，模型最重要的不是“懂多少图形库”，而是严格遵守这 6 条：

1. 只返回原始 `<mxGraphModel>...</mxGraphModel>`，不要返回 Markdown、JSON、解释文字，也不要返回 `<mxfile>`.
2. 必须包含 `root`，并保留默认父节点：`<mxCell id="0"/>` 和 `<mxCell id="1" parent="0"/>`.
3. 每个图形节点都要有 `vertex="1"`、`parent="1"` 和合法的 `<mxGeometry x y width height as="geometry"/>`.
4. 每条连接线都要有 `edge="1"`、`parent="1"`、`source`、`target`，以及 `<mxGeometry relative="1" as="geometry"/>`.
5. 所有 `id` 必须唯一；引用的 `source` / `target` 必须真实存在。
6. 优先生成简单、稳定、可渲染的基础图形，不要默认使用复杂自定义 shape XML。

## 2. 与当前扩展的关系

当前扩展在 [background.js](/Users/caopengbo/Documents/code/draw_io_sidebar/drawio-ai-sidebar-extension/background.js) 里有两个硬约束：

- 响应必须以 `<mxGraphModel` 开头，并且包含 `</mxGraphModel>`
- 返回内容必须是可解析 XML

这意味着：

- 模型不能返回 draw.io 默认保存时常见的压缩 `<mxfile>`
- 模型不能返回代码块包裹的 XML
- 模型不能先解释再给 XML

因此，提示词必须围绕“生成原始 `mxGraphModel`”来设计，而不是围绕 draw.io 文件格式的全部变体来设计。

## 3. 研究摘要

### 3.1 draw.io / diagrams.net 的底层模型

`draw.io` 基于 `mxGraph`。图由 `mxCell` 组成，节点和连线本质上都是 cell；布局和尺寸主要由 `mxGeometry` 描述；外观主要由 `style` 字符串描述。

官方 mxGraph 教程明确说明：

- cell 的样式存放在 `cell.style`
- 样式是由 `stylename` 和 `key=value;` 片段组成的字符串
- 顶点和边的几何信息规则不同

### 3.2 生成时最重要的三个结构

1. `mxGraphModel`
   整张图的根节点。

2. `mxCell`
   图元本体。节点通常是 `vertex="1"`，连线通常是 `edge="1"`。

3. `mxGeometry`
   顶点需要 `x/y/width/height`；边通常用 `relative="1"`，必要时再加控制点。

### 3.3 为什么不要默认输出 `<mxfile>`

官方资料说明，draw.io 保存文件时常见的是压缩后的 `<mxfile>` 包装格式；但当前扩展不是在“导入 draw.io 文件”，而是在“直接注入原始图模型”。所以这里不该让模型生成压缩格式或外层包装。

## 4. 模型必须遵守的硬规则

下面这些规则建议直接写进 system prompt。

### 4.1 输出边界

- 输出必须是纯 XML
- XML 根节点必须是 `<mxGraphModel>`
- 不要输出 `````xml` 代码块
- 不要输出 `<mxfile>`
- 不要输出注释、解释、前言、总结

### 4.2 基础骨架

最小合法结构建议固定为：

```xml
<mxGraphModel grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
  </root>
</mxGraphModel>
```

如果是新建图，建议从这个骨架开始扩展。

### 4.3 顶点规则

每个可见节点至少应满足：

- `vertex="1"`
- `parent="1"`
- 有 `<mxGeometry ... as="geometry"/>`
- `width` 和 `height` 为正数
- 若节点带文字，优先在 `value` 中写纯文本

示例：

```xml
<mxCell id="n1" value="Start" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="1">
  <mxGeometry x="80" y="80" width="80" height="80" as="geometry"/>
</mxCell>
```

### 4.4 连线规则

每条连接线至少应满足：

- `edge="1"`
- `parent="1"`
- 有 `source` 和 `target`
- 有 `<mxGeometry relative="1" as="geometry"/>`

示例：

```xml
<mxCell id="e1" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;" edge="1" parent="1" source="n1" target="n2">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

### 4.5 XML 安全规则

- `value` 中出现 `<`、`>`、`&` 时必须做 XML 转义
- 非必要不要在 `value` 里拼复杂 HTML
- 如果只是普通标签，优先输出纯文本
- 不要生成重复 `id`

## 5. 推荐的建图策略

这些不是底层协议要求，而是让模型更稳定的工程策略。

### 5.1 先简单后复杂

除非用户明确要求特定图形库、品牌图标或自定义形状，否则优先使用基础图形：

- 普通处理步骤：圆角矩形
- 判定：菱形
- 开始/结束：椭圆
- 数据存储：圆柱
- 注释：note 或 text
- 容器/分组：swimlane 或普通矩形容器

原因很简单：基础图形的渲染成功率最高，样式字符串也最稳定。

### 5.2 先做结构，再做美化

优先保证：

- 节点齐全
- 连线关系正确
- 文本清晰
- 布局不重叠

其次才是：

- 填充色
- 阴影
- 圆角
- 渐变
- 特殊形状

### 5.3 默认使用正交连线

大多数流程图、架构图、模块图，默认用正交线更稳定：

```text
edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;
```

只有在用户明确要求曲线、手绘、自由折线时，再考虑其他 edge style。

### 5.4 非必要不要引入 group 和嵌套 parent

如果只是普通流程图或系统架构图，优先把可见节点都挂在 `parent="1"` 下。  
只有在明确需要容器、泳道、分区、组合节点时，再引入更复杂的父子结构。

## 6. 常用样式配方

下面这些配方不是官方“唯一标准答案”，而是基于 draw.io 的 style 机制和常见导出 XML 归纳出来的实用默认值，适合给模型当稳定模板。

### 6.1 普通步骤 / 模块

```text
rounded=1;whiteSpace=wrap;html=1;
```

### 6.2 判定节点

```text
rhombus;whiteSpace=wrap;html=1;
```

### 6.3 开始 / 结束

```text
ellipse;whiteSpace=wrap;html=1;
```

### 6.4 数据存储

```text
shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;
```

### 6.5 纯文本说明

```text
text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;
```

### 6.6 容器 / 泳道

```text
swimlane;whiteSpace=wrap;html=1;horizontal=0;
```

### 6.7 默认连接线

```text
edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;endFill=1;
```

## 7. 布局启发式

给模型明确布局规则，通常比给更多“图论知识”更有用。

### 7.1 流程图

- 方向默认从上到下
- 同层节点横向对齐
- 节点间距建议 40 到 80
- 判定节点后至少给两个方向的出口

### 7.2 系统架构图

- 方向默认从左到右
- 前端、网关、服务、数据库按层摆放
- 同层模块尺寸尽量一致
- 数据库和外部系统放在底层或右侧

### 7.3 组织结构图

- 方向默认从上到下
- 上级节点居中
- 子节点横向均匀分布
- 使用正交连线，减少斜线

### 7.4 建议的默认尺寸

- 普通节点：`120x60` 或 `160x70`
- 开始/结束：`80x80` 或 `100x60`
- 判定：`100x100`
- 数据存储：`90x120`

如果图较复杂，可适当放大，但要保持同类节点尺寸一致。

## 8. 修改现有 XML 时的提示词要求

当用户不是“从零生成”，而是“基于当前图修改”时，提示词要显式要求模型：

1. 保留原有 `mxGraphModel` 根属性，除非用户明确要求改页面大小、网格或阴影。
2. 尽量复用未修改节点的 `id`。
3. 只修改与当前需求直接相关的节点、文本、样式和连线。
4. 如果新增节点，要补齐相关连线，不要只加孤立节点。
5. 如果删除节点，要同步删除失效连线。
6. 如果原图已经合法，不要为了“更美观”而整图重排，除非用户明确要求重新布局。

一句话原则：`增量修改优先，整图重写次之。`

## 9. 不建议模型默认做的事

- 不要默认生成复杂自定义 shape XML
- 不要默认生成图片 URL、图标库依赖、外部 stencil 名称
- 不要默认加大量 waypoint
- 不要默认把所有 label 写成 HTML
- 不要默认混入 `<mxfile>`、`<diagram>` 或压缩内容
- 不要为了“高级感”加入大量颜色、阴影、渐变，先确保图可用

## 10. 推荐的 System Prompt

下面这版适合直接作为长版 system prompt 使用。

```text
You are an expert diagrams.net (draw.io) XML generator.

Return only valid draw.io mxGraphModel XML.
Do not return Markdown fences, explanations, JSON, or any text before or after the XML.
The output must start with <mxGraphModel and end with </mxGraphModel>.
Do not output <mxfile>, <diagram>, compressed content, or comments.

Use a valid mxGraphModel structure with:
- <root>
- <mxCell id="0"/>
- <mxCell id="1" parent="0"/>

For every visible node:
- use vertex="1"
- use a valid parent, usually parent="1"
- include <mxGeometry x="..." y="..." width="..." height="..." as="geometry"/>

For every connector:
- use edge="1"
- include parent="1"
- include valid source and target ids
- include <mxGeometry relative="1" as="geometry"/>

Keep all ids unique.
Escape XML special characters in labels.
Prefer simple built-in shapes and stable styles over complex custom shapes.
Prefer orthogonal connectors unless the user explicitly asks for another routing style.
If modifying an existing diagram, preserve unchanged cells and ids whenever possible, and only change the cells relevant to the request.

Prioritize correctness and renderability over visual flourish.
If uncertain, generate a simpler diagram that is valid and readable rather than a complex diagram that may fail to parse or render.
```

## 11. 推荐的 User Prompt 模板

如果你要进一步提高稳定性，用户消息也建议固定结构，而不是只给一句自然语言。

```text
Task:
Create or update a draw.io diagram.

Requirements:
{{user_requirement}}

Diagram type:
{{flowchart|architecture|orgchart|uml|mindmap|other}}

Layout direction:
{{top-to-bottom|left-to-right|auto}}

Style preference:
{{minimal|professional|colorful|monochrome}}

Current diagram XML:
{{current_xml_or_empty}}

Output rules:
- Return only raw mxGraphModel XML
- No markdown fences
- No explanations
- Keep the diagram readable and non-overlapping
- Prefer simple built-in shapes
- Preserve existing ids and structure where possible when modifying
```

## 12. 更适合当前项目的“紧凑版”提示词

如果你需要把 system prompt 继续写成代码里的短字符串版本，可以先用下面这个：

```text
You are a draw.io XML assistant. Return only valid raw mxGraphModel XML with no markdown or explanations. Output must start with <mxGraphModel and end with </mxGraphModel>. Do not output <mxfile> or compressed content. Use <root><mxCell id="0"/><mxCell id="1" parent="0"/>...</root>. Every node must be a valid vertex with geometry. Every connector must be a valid edge with source, target and relative geometry. Keep ids unique, escape XML labels, prefer simple built-in shapes and orthogonal edges, and preserve unchanged ids/cells when modifying an existing diagram.
```

## 13. 落地建议

如果后续要继续优化生成质量，建议按这个顺序做：

1. 先替换 system prompt
2. 再把用户输入包装成结构化模板
3. 再补 few-shot 示例
4. 最后才考虑复杂 shape 库或特定图种专用 prompt

原因是前两步解决的是“合法性”和“稳定性”，收益最高。

## 14. 参考资料

官方资料和当前项目代码是这份文档的主要依据：

- mxGraph Tutorial: https://jgraph.github.io/mxgraph/docs/tutorial.html
- mxGraph User Manual: https://jgraph.github.io/mxgraph/docs/manual.html
- mxGeometry API: https://jgraph.github.io/mxgraph/docs/js-api/files/model/mxGeometry-js.html
- draw.io shape styles FAQ: https://www.drawio.com/doc/faq/shape-styles
- draw.io custom shape FAQ: https://www.drawio.com/doc/faq/shape-complex-create-edit
- draw.io 官方关于 `mxfile` / 原始 XML 的说明: https://drawio-app.com/blog/extracting-the-xml-from-mxfiles/
- draw.io libraries format: https://github.com/jgraph/drawio-libs
- 当前扩展的 XML 约束实现: [background.js](/Users/caopengbo/Documents/code/draw_io_sidebar/drawio-ai-sidebar-extension/background.js)
