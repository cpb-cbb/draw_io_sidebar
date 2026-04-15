# Draw.io AI Sidebar Extension

## 中文说明

### 功能

- 在 `app.diagrams.net` 注入 AI 侧边栏
- 聊天式交互，支持多轮上下文
- 对话历史本地存储（默认保留最近 30 条）
- 多 Profile 配置（`profileName` / `baseLLMUrl` / `apiKey` / `modelList`）
- 顶部模型下拉使用 `Profile name/model name`
- 仅当 Profile 测试成功后，模型才会进入顶部可选模型列表
- 生成请求会严格使用当前选中 `Profile/model` 对应的 API 参数
- 支持上传图片作为多模态上下文
- 支持画布区域截图、涂鸦、拖拽文字标注后再发送
- 生成中会在对话区显示等待动画（spinner）
- 生成完成后显示 token 消耗（优先展示 `total_tokens`）
- 基于当前画布 XML + 自然语言生成新 XML
- 支持“一键生成并注入”到 draw.io 画布
- 记录最近 50 个 XML 版本，支持“上一步/下一步”并自动注入

### 默认行为

- UI 默认语言：英文（`en`）
- 模型接口默认走 OpenAI 兼容协议：
  - URL: `{baseLLMUrl}/chat/completions`
  - Header: `Authorization: Bearer {apiKey}`
  - Body: `model + messages`

### 安装

1. 打开 `chrome://extensions`
2. 开启开发者模式
3. 点击“加载已解压的扩展程序”
4. 选择目录 `drawio-ai-sidebar-extension`
5. 打开 `https://app.diagrams.net/`
6. 点击浏览器工具栏扩展图标，打开侧边栏

### 使用流程

1. 打开设置，创建或选择一个 Profile
2. 填写 `baseLLMUrl`、`apiKey`、`modelList`（每行一个模型）
3. 点击 Test，只有测试通过的模型会进入顶部下拉
4. 在顶部选择 `Profile/model`
5. 输入需求，点击 Generate only 或 Generate and inject
6. 在 XML 面板可用“上一步/下一步”切换历史版本并自动注入

### 项目结构

- `manifest.json`: Chrome MV3 配置
- `background.js`: API 请求、截图、XML 注入和读取
- `content.js`: 侧边栏 UI 与交互逻辑
- `content.css`: 侧边栏与截图编辑器样式

### 注意事项

- 由于支持自定义模型地址，`host_permissions` 目前为 `<all_urls>`
- 生产环境建议改为受控白名单域名
- 如你的接口不是 OpenAI 兼容格式，请修改 `background.js` 中请求构造逻辑

---

## English

### Features

- Injects an AI sidebar into `app.diagrams.net`
- Chat-style interaction with multi-turn context
- Local chat history persistence (keeps the latest 30 messages)
- Multi-profile config (`profileName` / `baseLLMUrl` / `apiKey` / `modelList`)
- Top model selector uses `Profile name/model name`
- Models are added to the top selector only after a successful profile test
- Generation requests always use API params from the selected `Profile/model`
- Supports image upload as multimodal context
- Supports canvas-region screenshot, drawing, and draggable text annotation
- Shows a spinner bubble while generation is running
- Shows token usage after completion (prefers `total_tokens`)
- Generates draw.io XML from current canvas XML + natural language prompt
- One-click generate and inject to draw.io canvas
- Keeps the latest 50 XML versions, with Previous/Next auto-inject navigation

### Default Behavior

- Default UI language: English (`en`)
- Uses OpenAI-compatible API by default:
  - URL: `{baseLLMUrl}/chat/completions`
  - Header: `Authorization: Bearer {apiKey}`
  - Body: `model + messages`

### Installation

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click Load unpacked
4. Select folder `drawio-ai-sidebar-extension`
5. Open `https://app.diagrams.net/`
6. Click the extension icon in the browser toolbar to open the sidebar

### Workflow

1. Open Settings and create/select a profile
2. Fill in `baseLLMUrl`, `apiKey`, and `modelList` (one model per line)
3. Click Test; only passed models appear in the top selector
4. Choose `Profile/model` from the top dropdown
5. Enter your prompt, then click Generate only or Generate and inject
6. Use Previous/Next in the XML panel to move across saved XML versions with auto-inject

### Project Structure

- `manifest.json`: Chrome MV3 manifest
- `background.js`: API requests, screenshot, XML injection/read
- `content.js`: Sidebar UI and interaction logic
- `content.css`: Sidebar and screenshot editor styles

### Notes

- `host_permissions` is currently `<all_urls>` to allow custom endpoints
- For production, use a strict domain allowlist
- If your endpoint is not OpenAI-compatible, update request builder logic in `background.js`
