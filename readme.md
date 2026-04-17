# 项目说明

## 中文

这是一个面向 draw.io（app.diagrams.net）的 Chrome 插件。
它会在页面右侧注入 AI 侧边栏，让用户通过自然语言生成或修改流程图，并将 XML 直接注入当前画布。

在传统流程中，用户通常需要手动打开“编辑绘图”并粘贴 XML。
本插件将该流程简化为“描述需求 -> 生成 XML -> 一键注入”，显著提升绘图迭代效率。

### 主要功能

1. 在 draw.io 页面内提供聊天式 AI 交互。
2. 支持自然语言生成流程图 XML，并可一键注入到画布。
3. 支持多 Profile 配置（baseLLMUrl、API Key、模型列表等），并在本地浏览器保存。
4. 支持上传图片作为多模态上下文，帮助模型理解需求。
5. 支持画布区域截图，并在截图上进行涂鸦和文字标注后发送给模型。
6. 支持多轮上下文，便于持续迭代优化流程图。

### 使用方法

1. 打开 Chrome 扩展管理页 `chrome://extensions`，开启开发者模式。
2. 点击“加载已解压的扩展程序”，选择 `drawio-ai-sidebar-extension` 目录。
3. 打开 `https://app.diagrams.net/`，点击浏览器工具栏中的扩展图标打开侧边栏。
4. 点击侧边栏设置，创建或选择一个 Profile，填写 `baseLLMUrl`、`API Key`、`modelList`（每行一个）。
5. 点击 Test 测试连通性，测试通过的模型会出现在顶部 `Profile/Model` 下拉列表。
6. 输入你的需求描述，可选上传图片或截图标注，然后点击 Generate only 或 Generate and inject。
7. 如需手动处理 XML，可在 XML 面板查看、编辑并执行注入。

## English

This is a Chrome extension for draw.io (app.diagrams.net).
It injects an AI sidebar into the page, allowing users to generate or modify diagrams with natural language and inject XML directly into the current canvas.

In a traditional workflow, users usually open "Edit Diagram" and paste XML manually.
This extension streamlines the process into "describe -> generate XML -> inject", which significantly improves iteration speed.

### Key Features

1. Chat-style AI interaction directly inside draw.io.
2. Natural-language generation of diagram XML with one-click injection.
3. Multi-profile configuration (baseLLMUrl, API key, model list, etc.) stored locally in the browser.
4. Image upload for multimodal context to improve model understanding.
5. Canvas-region screenshot with annotation support (freehand drawing and text notes) before sending to the model.
6. Multi-turn context support for continuous diagram refinement.

### Usage

1. Open `chrome://extensions` in Chrome and enable Developer mode.
2. Click Load unpacked and select the `drawio-ai-sidebar-extension` folder.
3. Open `https://app.diagrams.net/`, then click the extension icon in the browser toolbar to open the sidebar.
4. Open Settings, create or select a profile, and fill in `baseLLMUrl`, `API Key`, and `modelList` (one model per line).
5. Click Test. Only passed models will appear in the top `Profile/Model` dropdown.
6. Enter your prompt, optionally add an uploaded image or screenshot annotations, then click Generate only or Generate and inject.
7. If needed, use the XML panel to review/edit XML and inject manually.



