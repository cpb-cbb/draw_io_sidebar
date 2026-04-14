# Draw.io XML 注入最小 Demo (Chrome MV3)

## 你会得到什么

- 在扩展 popup 中嵌入 `https://embed.diagrams.net`
- 收到 `init` 后发送 `load(xml)` 注入图
- 监听 `save/autosave` 回传 XML
- 向当前 `https://app.diagrams.net` 标签页后台注入 XML，不弹出“编辑绘图”对话框

## 如何运行

1. 打开 Chrome 的扩展管理页：`chrome://extensions`
2. 开启开发者模式
3. 点击“加载已解压的扩展程序”
4. 选择本目录 `demo-extension`
5. 点击扩展图标，打开 popup

## 如何验证注入

1. popup 打开后，状态区显示“等待编辑器 init...”
2. init 后会自动发送 `load(xml)`
3. 你会在 draw.io 编辑器中看到两节点和一条连线
4. 在编辑器里修改图并点 Save，右下方“回传 XML”会更新

## 注入当前标签页

1. 打开一个 `https://app.diagrams.net` 标签页
2. 打开扩展 popup
3. 点击“注入当前标签页”
4. 扩展会在页面后台直接更新图模型，你会直接看到画布变化

## 说明

- 该 demo 使用官方 embed + JSON 协议方式，不依赖页面内部私有对象。
- 如果你后续要对接业务接口，只需要把 `popup.js` 中的 `xmlInput.value` 改为你的 XML 数据来源。
