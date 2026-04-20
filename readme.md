# Draw.io Sidebar Project

## 中文

这是一个围绕 `draw.io / app.diagrams.net` 的 Chrome 扩展项目，核心目标是把“自然语言生成图表 XML 并注入画布”的流程做得更顺手。

当前仓库主要包含两个部分：

1. `drawio-ai-sidebar-extension`
   面向实际使用的 AI 侧边栏扩展，可在 draw.io 页面右侧注入聊天式面板。
2. `demo-extension`
   更轻量的最小示例，用于演示 XML 注入与基础交互流程。

传统流程里，用户通常需要手动打开“编辑绘图”并粘贴 XML。
这个项目把流程收敛为“描述需求 -> 生成 XML -> 注入当前画布”，用于提升流程图、架构图、原型图等场景下的迭代效率。

### 主要功能

1. 在 draw.io 页面内提供聊天式 AI 交互。
2. 支持结合当前画布 XML，通过自然语言生成或修改图表。
3. 支持一键注入 XML 到当前画布，减少手工复制粘贴。
4. 支持多 Profile 配置，如 `baseLLMUrl`、`apiKey`、`modelList`。
5. 支持上传图片作为多模态上下文，辅助模型理解需求。
6. 支持画布区域截图、涂鸦和文字标注后发送给模型。
7. 支持多轮上下文和 XML 历史版本切换，便于持续迭代。

### 适用场景

- 快速生成流程图、时序图、结构图草稿
- 基于已有 draw.io 图继续增量修改
- 让非技术同学用自然语言参与画图
- 用 AI 辅助完成重复性较高的 XML 编写工作

### 快速开始

1. 打开 Chrome 扩展管理页 `chrome://extensions`。
2. 开启开发者模式。
3. 点击“加载已解压的扩展程序”。
4. 选择 `drawio-ai-sidebar-extension` 目录。
5. 打开 `https://app.diagrams.net/`。
6. 点击浏览器工具栏中的扩展图标，打开侧边栏。
7. 创建或选择一个 Profile，填写 `baseLLMUrl`、`apiKey`、`modelList`。
8. 点击 `Test` 验证模型连通性。
9. 输入需求，按需上传图片或截图标注，然后执行 `Generate only` 或 `Generate and inject`。

### 仓库结构

- `drawio-ai-sidebar-extension/`：主扩展源码
- `demo-extension/`：最小可运行演示扩展
- `docs/`：补充文档与说明
- `image/`：项目截图与演示图片

### 开发说明

- 当前主扩展基于 Chrome Extension Manifest V3。
- 默认注入站点为 `https://app.diagrams.net/*`。
- 如果你的模型接口不是 OpenAI 兼容格式，需要按实际协议调整扩展里的请求构造逻辑。
- 建议在提交前至少手动验证一次：侧边栏加载、Profile 测试、XML 生成、注入流程是否正常。

### 欢迎贡献

欢迎各位大佬贡献和完善代码仓库，也欢迎提交 Issue、PR 或改进建议。

如果你准备参与贡献，比较推荐的方向包括：

1. 优化提示词与 XML 生成质量。
2. 改进侧边栏交互体验和界面细节。
3. 增强截图标注、多模态输入与上下文管理能力。
4. 补充异常处理、容错逻辑和调试信息。
5. 完善文档、示例、安装说明与最佳实践。

提交代码时，尽量保持改动聚焦、说明清晰，便于 review 和后续维护。

## English

This repository contains Chrome extensions around `draw.io / app.diagrams.net`, focused on turning natural-language requests into diagram XML and injecting the result back into the canvas.

The repository currently has two main parts:

1. `drawio-ai-sidebar-extension`
   The main AI sidebar extension intended for actual use inside draw.io.
2. `demo-extension`
   A smaller runnable demo for XML injection and basic interaction flow.

In the traditional workflow, users often open the diagram editor and paste XML manually.
This project simplifies that into "describe -> generate XML -> inject", which helps speed up iteration for flowcharts, architecture diagrams, and similar diagramming tasks.

### Key Features

1. Chat-style AI interaction directly inside draw.io.
2. Natural-language generation or modification based on the current canvas XML.
3. One-click XML injection into the active diagram canvas.
4. Multi-profile configuration for `baseLLMUrl`, `apiKey`, and `modelList`.
5. Image upload support for multimodal context.
6. Canvas screenshot, drawing, and text annotation before sending context to the model.
7. Multi-turn context and XML history navigation for iterative editing.

### Quick Start

1. Open `chrome://extensions` in Chrome.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select the `drawio-ai-sidebar-extension` folder.
5. Open `https://app.diagrams.net/`.
6. Click the extension icon to open the sidebar.
7. Create or select a profile and fill in `baseLLMUrl`, `apiKey`, and `modelList`.
8. Click `Test` to verify model connectivity.
9. Enter your request, optionally attach images or screenshot annotations, then use `Generate only` or `Generate and inject`.

### Repository Structure

- `drawio-ai-sidebar-extension/`: main extension source
- `demo-extension/`: minimal runnable demo
- `docs/`: supplemental documentation
- `image/`: screenshots and demo images

### Development Notes

- The main extension uses Chrome Extension Manifest V3.
- The default injection target is `https://app.diagrams.net/*`.
- If your model endpoint is not OpenAI-compatible, update the request-building logic accordingly.
- Before submitting changes, it is recommended to verify sidebar loading, profile testing, XML generation, and injection manually.

### Contributing

Contributions are welcome. PRs, issues, and concrete improvement suggestions are all useful.

Common contribution areas include:

1. Better prompts and higher-quality XML generation.
2. UI and interaction improvements for the sidebar.
3. Stronger screenshot annotation, multimodal, and context-management workflows.
4. Better error handling, resilience, and debugging information.
5. Improved docs, examples, onboarding, and best practices.

Please keep changes focused and explain them clearly so they are easier to review and maintain.


