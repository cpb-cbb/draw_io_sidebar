# Draw.io AI Sidebar Extension

## 功能覆盖

- 在 app.diagrams.net 页面注入 AI 侧边栏
- 聊天式侧栏交互，支持多轮对话
- 对话 history 本地存储，后续提问自动带上下文
- 自定义并本地保存 `apiKey`、`baseLLMUrl`、`model`、`temperature`、`max_tokens`
- 模型下拉选择 + 模型清单配置（设置弹窗）
- 上传参考图片
- 截屏后涂鸦和可拖拽文字标注，再作为多模态上下文发送给模型
- 基于当前画布 XML + 自然语言请求生成新 XML
- 后台自动注入到当前 draw.io 画布，无需手动打开“编辑绘图”

## 目录

- `manifest.json`: MV3 配置
- `background.js`: 截屏、模型请求、XML 注入与读取
- `content.js`: 侧边栏 UI 与交互逻辑
- `content.css`: 侧边栏样式与截图编辑器样式

## 使用方式

1. 打开 `chrome://extensions`
2. 开启开发者模式
3. 点击加载已解压的扩展程序
4. 选择本目录 `drawio-ai-sidebar-extension`
5. 打开 `https://app.diagrams.net/`
6. 页面右侧点击 `AI 侧边栏`

## 模型接口说明

当前默认使用 OpenAI 兼容接口：

- URL: `{baseLLMUrl}/chat/completions`
- Header: `Authorization: Bearer {apiKey}`
- Body: `model + messages`

如果你的接口字段不同，请在 `background.js` 里的 `requestXmlFromLlm` 和 `buildOpenAICompatiblePayload` 调整。

## 注意事项

- 由于允许用户自定义任意模型地址，`host_permissions` 使用了 `<all_urls>`。
- 生产环境建议改成受控域名白名单。
- 当前 history 存储在 `chrome.storage.local`，默认保留最近 30 条消息。
