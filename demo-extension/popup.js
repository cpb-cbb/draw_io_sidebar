const EMBED_ORIGIN = "https://embed.diagrams.net";

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1440" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="XML Injected" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
      <mxGeometry x="120" y="120" width="180" height="80" as="geometry"/>
    </mxCell>
    <mxCell id="3" value="By Chrome Extension" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;" vertex="1" parent="1">
      <mxGeometry x="360" y="120" width="190" height="80" as="geometry"/>
    </mxCell>
    <mxCell id="4" style="endArrow=classic;html=1;rounded=0;" edge="1" source="2" target="3" parent="1">
      <mxGeometry relative="1" as="geometry"/>
    </mxCell>
  </root>
</mxGraphModel>`;

const xmlInput = document.getElementById("xmlInput");
const resultXml = document.getElementById("resultXml");
const statusEl = document.getElementById("status");
const frame = document.getElementById("editorFrame");
const injectTabBtn = document.getElementById("injectTabBtn");
const loadBtn = document.getElementById("loadBtn");
const templateBtn = document.getElementById("templateBtn");

let editorReady = false;

xmlInput.value = SAMPLE_XML;

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.style.color = isError ? "#842029" : "#0f5132";
}

function postToEditor(payload) {
  if (!frame.contentWindow) {
    setStatus("iframe 未就绪", true);
    return;
  }
  frame.contentWindow.postMessage(JSON.stringify(payload), EMBED_ORIGIN);
}

function loadXmlToEditor() {
  if (!editorReady) {
    setStatus("编辑器还没 init，稍等几秒再试", true);
    return;
  }
  const xml = xmlInput.value.trim();
  if (!xml) {
    setStatus("XML 为空", true);
    return;
  }
  postToEditor({ action: "load", xml, autosave: 1 });
  setStatus("已发送 load(xml)");
}

async function injectXmlToCurrentTab() {
  setStatus("正在注入当前标签页...");

  const xml = xmlInput.value.trim();

  if (!xml) {
    setStatus("XML 为空", true);
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.id || !tab.url) {
    setStatus("未找到当前标签页", true);
    return;
  }

  if (!tab.url.startsWith("https://app.diagrams.net/")) {
    setStatus("请先切换到 app.diagrams.net 标签页", true);
    return;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      world: "MAIN",
      args: [xml],
      func: async (xmlPayload) => {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const safeGet = (getter) => {
          try {
            return getter();
          } catch {
            return undefined;
          }
        };

        const hasEditorApi = (obj) => {
          if (!obj || typeof obj !== "object") {
            return false;
          }

          const editor = safeGet(() => obj.editor);
          const setGraphXml = safeGet(() => editor && editor.setGraphXml);
          const graph = safeGet(() => editor && editor.graph);

          return !!(editor && graph && typeof setGraphXml === "function");
        };

        const findUiByScan = () => {
          const names = Object.getOwnPropertyNames(window);
          for (const name of names) {
            let val;
            try {
              val = window[name];
            } catch {
              continue;
            }
            if (hasEditorApi(val)) {
              return val;
            }

            // 兼容 App.editorUi 这类一层嵌套对象。
            if (val && typeof val === "object") {
              const nestedKeys = safeGet(() => Object.keys(val)) || [];
              for (const key of nestedKeys) {
                const nested = safeGet(() => val[key]);
                if (hasEditorApi(nested)) {
                  return nested;
                }
              }
            }
          }
          return null;
        };

        const getUi = () => {
          const directUi = safeGet(() => window.ui);
          if (hasEditorApi(directUi)) return directUi;

          const editorUi = safeGet(() => window.editorUi);
          if (hasEditorApi(editorUi)) return editorUi;

          const currentUi = safeGet(() => window.EditorUi && window.EditorUi.currentUi);
          if (hasEditorApi(currentUi)) return currentUi;

          const scanned = findUiByScan();
          if (hasEditorApi(scanned)) return scanned;
          return null;
        };

        try {
          let ui = getUi();

          // 页面首次加载时全局对象可能稍晚出现，短时重试。
          for (let i = 0; !ui && i < 20; i += 1) {
            await sleep(100);
            ui = getUi();
          }

          if (!ui || !ui.editor) {
            return {
              ok: false,
              error: "当前 frame 未找到 draw.io UI 实例",
              href: window.location.href
            };
          }

          const parser = new DOMParser();
          const doc = parser.parseFromString(xmlPayload, "application/xml");
          if (doc.querySelector("parsererror")) {
            return { ok: false, error: "XML 解析失败" };
          }

          if (typeof ui.editor.setGraphXml === "function") {
            ui.editor.setGraphXml(doc.documentElement);

            if (typeof ui.editor.setModified === "function") {
              ui.editor.setModified(true);
            }

            if (ui.editor.graph && typeof ui.editor.graph.refresh === "function") {
              ui.editor.graph.refresh();
            }

            return { ok: true, method: "editor.setGraphXml", href: window.location.href };
          }

          const graph = ui.editor.graph;
          if (graph && typeof window.mxCodec === "function") {
            const codec = new window.mxCodec(doc);
            codec.decode(doc.documentElement, graph.getModel());
            graph.refresh();
            if (typeof ui.editor.setModified === "function") {
              ui.editor.setModified(true);
            }
            return { ok: true, method: "mxCodec.decode", href: window.location.href };
          }

          return {
            ok: false,
            error: "找到 UI 但未找到可用注入 API",
            href: window.location.href
          };
        } catch (error) {
          return { ok: false, error: error?.message || String(error), href: window.location.href };
        }
      }
    });

    const success = results.find((item) => item.result && item.result.ok);
    if (success) {
      setStatus(`后台注入成功，方法: ${success.result.method || "unknown"}`);
      return;
    }

    const firstErr = results.find((item) => item.result && !item.result.ok)?.result;
    setStatus(firstErr?.error || "标签页注入失败", true);
  } catch (err) {
    setStatus(`发送失败: ${err.message}`, true);
  }
}

window.addEventListener("message", (event) => {
  if (event.origin !== EMBED_ORIGIN) {
    return;
  }
  if (event.source !== frame.contentWindow) {
    return;
  }

  let data;
  try {
    data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
  } catch {
    return;
  }

  if (!data || typeof data !== "object") {
    return;
  }

  if (data.event === "init") {
    editorReady = true;
    setStatus("收到 init，准备注入 XML");
    loadXmlToEditor();
    return;
  }

  if (data.event === "load") {
    setStatus("编辑器已加载 XML");
    return;
  }

  if (data.event === "autosave" || data.event === "save") {
    if (typeof data.xml === "string") {
      resultXml.value = data.xml;
      setStatus(`收到 ${data.event} 回传 XML，长度 ${data.xml.length}`);
    }
    return;
  }

  if (data.error) {
    setStatus(`编辑器返回错误: ${data.error}`, true);
  }
});

loadBtn.addEventListener("click", loadXmlToEditor);
injectTabBtn.addEventListener("click", injectXmlToCurrentTab);

templateBtn.addEventListener("click", () => {
  xmlInput.value = SAMPLE_XML;
  setStatus("已恢复示例 XML");
});

setStatus("等待编辑器 init...");
