const FULL_XML_SYSTEM_PROMPT = [
  "You are a draw.io XML assistant.",
  "Return only valid draw.io mxGraphModel XML.",
  "Do not include markdown fences.",
  "If user asks for modification, update based on current diagram XML.",
  "Output must start with <mxGraphModel and be parseable XML."
].join(" ");

const INLINE_IMAGE_PLACEHOLDER = "[IMAGE_DATA]";
const INLINE_IMAGE_MIN_DATA_URL_LENGTH = 200;

function sanitizeInlineImageDataUrls(input) {
  const text = String(input || "");
  if (!text) {
    return text;
  }

  return text.replace(/data:image\/[a-zA-Z0-9.+-]+(?:;base64)?,[^;"'<\s]+/g, (match) => {
    return match.length >= INLINE_IMAGE_MIN_DATA_URL_LENGTH ? INLINE_IMAGE_PLACEHOLDER : match;
  });
}

function jsonResponse(ok, data) {
  return { ok, ...data };
}

function buildHistoryMessages(historyList) {
  const history = Array.isArray(historyList) ? historyList : [];
  const trimmed = history.slice(-12);
  return trimmed
    .map((item) => {
      if (!item || !item.role) {
        return null;
      }

      if (item.role === "assistant") {
        const content = item.xml
          ? `Generated draw.io XML:\n${sanitizeInlineImageDataUrls(item.xml)}`
          : item.text || "";
        return { role: "assistant", content };
      }

      return { role: "user", content: item.text || "" };
    })
    .filter(Boolean);
}

function buildOpenAICompatiblePayload({ model, userPrompt, currentXml, imageDataUrls, history, temperature, maxTokens }) {
  const sanitizedCurrentXml = sanitizeInlineImageDataUrls(currentXml);
  const normalizedImageDataUrls = Array.isArray(imageDataUrls)
    ? imageDataUrls.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const textParts = [];
  textParts.push("User requirement:");
  textParts.push(userPrompt || "");
  if (sanitizedCurrentXml) {
    textParts.push("Current diagram XML:");
    textParts.push(sanitizedCurrentXml);
  }

  const historyMessages = buildHistoryMessages(history);

  if (normalizedImageDataUrls.length) {
    return {
      model,
      messages: [
        { role: "system", content: FULL_XML_SYSTEM_PROMPT },
        ...historyMessages,
        {
          role: "user",
          content: [
            { type: "text", text: textParts.join("\n\n") },
            ...normalizedImageDataUrls.map((url) => ({ type: "image_url", image_url: { url } }))
          ]
        }
      ],
      temperature: typeof temperature === "number" ? temperature : 0.2,
      max_tokens: typeof maxTokens === "number" ? maxTokens : undefined
    };
  }

  return {
    model,
    messages: [
      { role: "system", content: FULL_XML_SYSTEM_PROMPT },
      ...historyMessages,
      { role: "user", content: textParts.join("\n\n") }
    ],
    temperature: typeof temperature === "number" ? temperature : 0.2,
    max_tokens: typeof maxTokens === "number" ? maxTokens : undefined
  };
}

function extractXmlFromResponse(content) {
  if (!content || typeof content !== "string") {
    return "";
  }

  const fenced = content.match(/```(?:xml)?\s*([\s\S]*?)\s*```/i);
  const raw = (fenced ? fenced[1] : content).trim();

  const start = raw.indexOf("<mxGraphModel");
  const end = raw.lastIndexOf("</mxGraphModel>");

  if (start >= 0 && end > start) {
    return raw.slice(start, end + "</mxGraphModel>".length);
  }

  return raw;
}

function normalizeMessageContent(content) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }
        if (part && typeof part === "object" && typeof part.text === "string") {
          return part.text;
        }
        return "";
      })
      .join("\n")
      .trim();
  }

  return "";
}

function toFiniteNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function normalizeUsage(rawUsage) {
  if (!rawUsage || typeof rawUsage !== "object") {
    return null;
  }

  const promptTokens = toFiniteNumber(rawUsage.prompt_tokens ?? rawUsage.input_tokens);
  const completionTokens = toFiniteNumber(rawUsage.completion_tokens ?? rawUsage.output_tokens);
  const inferredTotal =
    promptTokens !== null && completionTokens !== null
      ? promptTokens + completionTokens
      : null;
  const totalTokens = toFiniteNumber(rawUsage.total_tokens) ?? inferredTotal;

  if (promptTokens === null && completionTokens === null && totalTokens === null) {
    return null;
  }

  return {
    promptTokens,
    completionTokens,
    totalTokens
  };
}

function validateMxGraphXml(xml) {
  const value = String(xml || "").trim();

  if (!value.startsWith("<mxGraphModel") || !value.includes("</mxGraphModel>")) {
    throw new Error("Model response does not contain valid mxGraphModel XML.");
  }

  if (typeof DOMParser === "function") {
    const parser = new DOMParser();
    const doc = parser.parseFromString(value, "application/xml");
    if (doc.querySelector("parsererror")) {
      throw new Error("Generated XML is not parseable.");
    }
  }

  return value;
}

async function callChatCompletions(endpoint, apiKey, requestBody) {
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`LLM request failed: ${resp.status} ${text.slice(0, 200)}`);
  }

  const data = await resp.json();
  const content = normalizeMessageContent(data?.choices?.[0]?.message?.content || "");
  return {
    content,
    usage: normalizeUsage(data?.usage)
  };
}

async function requestFullXml(payload, endpoint) {
  const llmResponse = await callChatCompletions(
    endpoint,
    payload.apiKey,
    buildOpenAICompatiblePayload({
      model: payload.model || "gpt-4o-mini",
      userPrompt: payload.userPrompt,
      currentXml: payload.currentXml,
      imageDataUrls: Array.isArray(payload.imageDataUrls) ? payload.imageDataUrls : (payload.imageDataUrl ? [payload.imageDataUrl] : []),
      history: payload.history,
      temperature: payload.temperature,
      maxTokens: payload.maxTokens
    })
  );

  const xml = validateMxGraphXml(extractXmlFromResponse(llmResponse.content));
  return {
    xml,
    raw: llmResponse.content,
    usage: llmResponse.usage
  };
}

async function testApiConnectivity(payload) {
  const baseUrl = String(payload?.baseUrl || "").trim();
  const apiKey = String(payload?.apiKey || "").trim();
  const model = String(payload?.model || "gpt-4o-mini").trim() || "gpt-4o-mini";

  if (!baseUrl || !apiKey) {
    throw new Error("baseUrl and apiKey are required");
  }

  const endpoint = baseUrl.replace(/\/$/, "") + "/chat/completions";
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 8,
      temperature: 0
    })
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Test failed: ${resp.status} ${text.slice(0, 200)}`);
  }

  return { ok: true };
}

async function cropImageDataUrl(dataUrl, crop) {
  const dpr = Math.max(1, Number(crop?.dpr) || 1);
  const x = Math.max(0, Math.floor((Number(crop?.x) || 0) * dpr));
  const y = Math.max(0, Math.floor((Number(crop?.y) || 0) * dpr));
  const w = Math.max(1, Math.floor((Number(crop?.width) || 0) * dpr));
  const h = Math.max(1, Math.floor((Number(crop?.height) || 0) * dpr));

  const sourceResp = await fetch(dataUrl);
  const sourceBlob = await sourceResp.blob();
  const bitmap = await createImageBitmap(sourceBlob);

  if (w > bitmap.width || h > bitmap.height) {
    bitmap.close();
    return dataUrl;
  }

  const maxX = Math.max(0, bitmap.width - 1);
  const maxY = Math.max(0, bitmap.height - 1);
  const sx = Math.min(x, maxX);
  const sy = Math.min(y, maxY);
  const sw = Math.max(1, Math.min(w, bitmap.width - sx));
  const sh = Math.max(1, Math.min(h, bitmap.height - sy));

  const canvas = new OffscreenCanvas(sw, sh);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh);
  bitmap.close();

  const blob = await canvas.convertToBlob({ type: "image/png" });
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to convert cropped image"));
    reader.readAsDataURL(blob);
  });
}

async function requestXmlFromLlm(payload) {
  const endpoint = payload.baseUrl.replace(/\/$/, "") + "/chat/completions";
  return requestFullXml(payload, endpoint);
}

async function injectXmlToTab(tabId, xml) {
  const results = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    world: "MAIN",
    args: [xml],
    func: (xmlPayload) => {
      try {
        const safeGet = (getter) => {
          try {
            return getter();
          } catch {
            return undefined;
          }
        };

        const isObjectLike = (v) => !!v && (typeof v === "object" || typeof v === "function");

        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlPayload, "application/xml");
        if (doc.querySelector("parsererror")) {
          return { ok: false, error: "XML parse error" };
        }

        const mxGraphModelNode = doc.querySelector("mxGraphModel");
        if (!mxGraphModelNode) {
          return {
            ok: false,
            error: "XML must contain <mxGraphModel> (or mxfile with embedded mxGraphModel)"
          };
        }

        const candidateRoots = [
          safeGet(() => window.ui),
          safeGet(() => window.editorUi),
          safeGet(() => window.EditorUi && window.EditorUi.currentUi)
        ].filter(Boolean);

        function isUsableUi(c) {
          return !!(
            c &&
            safeGet(() => c.editor) &&
            typeof safeGet(() => c.editor.setGraphXml) === "function" &&
            safeGet(() => c.editor.graph)
          );
        }

        function deepFindUi(root, maxDepth = 3, maxKeysPerNode = 120) {
          const visited = new WeakSet();

          function walk(node, depth) {
            if (!isObjectLike(node)) return null;
            if (visited.has(node)) return null;
            visited.add(node);

            if (isUsableUi(node)) return node;
            if (depth <= 0) return null;

            let keys = [];
            try {
              keys = Object.getOwnPropertyNames(node);
            } catch {
              return null;
            }

            for (const key of keys.slice(0, maxKeysPerNode)) {
              let child;
              try {
                child = node[key];
              } catch {
                continue;
              }
              const found = walk(child, depth - 1);
              if (found) return found;
            }

            return null;
          }

          return walk(root, maxDepth);
        }

        function findUi() {
          for (const c of candidateRoots) {
            if (isUsableUi(c)) {
              return c;
            }
          }

          const deepFromWindow = deepFindUi(window, 2, 80);
          if (deepFromWindow) {
            return deepFromWindow;
          }

          const keys = Object.getOwnPropertyNames(window);
          for (const k of keys) {
            let v;
            try {
              v = window[k];
            } catch {
              continue;
            }
            if (isUsableUi(v)) {
              return v;
            }

            const deep = deepFindUi(v, 2, 60);
            if (deep) {
              return deep;
            }
          }
          return null;
        }

        const ui = findUi();
        if (!ui) {
          return {
            ok: false,
            error: "draw.io UI instance not found in this frame",
            href: window.location.href
          };
        }

        ui.editor.setGraphXml(mxGraphModelNode);
        if (typeof ui.editor.setModified === "function") {
          ui.editor.setModified(true);
        }
        if (ui.editor.graph && typeof ui.editor.graph.refresh === "function") {
          ui.editor.graph.refresh();
        }

        return { ok: true, method: "editor.setGraphXml", href: window.location.href };
      } catch (e) {
        return { ok: false, error: e?.message || String(e), href: window.location.href };
      }
    }
  });

  const success = results.find((r) => r.result?.ok);
  if (!success) {
    const firstErr = results.find((r) => r.result?.error)?.result?.error || "inject failed";
    throw new Error(firstErr);
  }

  return success.result;
}

async function getCurrentXmlFromTab(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    world: "MAIN",
    func: () => {
      try {
        const safeGet = (getter) => {
          try {
            return getter();
          } catch {
            return undefined;
          }
        };

        const isObjectLike = (v) => !!v && (typeof v === "object" || typeof v === "function");

        const candidateRoots = [
          safeGet(() => window.ui),
          safeGet(() => window.editorUi),
          safeGet(() => window.EditorUi && window.EditorUi.currentUi)
        ].filter(Boolean);

        function isUsableUi(c) {
          return !!(c && safeGet(() => c.editor) && typeof safeGet(() => c.editor.getGraphXml) === "function");
        }

        function deepFindUi(root, maxDepth = 3, maxKeysPerNode = 120) {
          const visited = new WeakSet();

          function walk(node, depth) {
            if (!isObjectLike(node)) return null;
            if (visited.has(node)) return null;
            visited.add(node);

            if (isUsableUi(node)) return node;
            if (depth <= 0) return null;

            let keys = [];
            try {
              keys = Object.getOwnPropertyNames(node);
            } catch {
              return null;
            }

            for (const key of keys.slice(0, maxKeysPerNode)) {
              let child;
              try {
                child = node[key];
              } catch {
                continue;
              }
              const found = walk(child, depth - 1);
              if (found) return found;
            }

            return null;
          }

          return walk(root, maxDepth);
        }

        function findUi() {
          for (const c of candidateRoots) {
            if (isUsableUi(c)) {
              return c;
            }
          }

          const deepFromWindow = deepFindUi(window, 2, 80);
          if (deepFromWindow) {
            return deepFromWindow;
          }

          const keys = Object.getOwnPropertyNames(window);
          for (const k of keys) {
            let v;
            try {
              v = window[k];
            } catch {
              continue;
            }
            if (isUsableUi(v)) {
              return v;
            }

            const deep = deepFindUi(v, 2, 60);
            if (deep) {
              return deep;
            }
          }
          return null;
        }

        const ui = findUi();
        if (!ui) {
          return { ok: false, error: "draw.io UI not found" };
        }

        const node = ui.editor.getGraphXml();
        const xml = new XMLSerializer().serializeToString(node);
        return { ok: true, xml };
      } catch (e) {
        return { ok: false, error: e?.message || String(e) };
      }
    }
  });

  const success = results.find((r) => r.result?.ok);
  if (!success) {
    const firstErr = results.find((r) => r.result?.error)?.result?.error || "get xml failed";
    throw new Error(firstErr);
  }

  return success.result.xml;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message?.type === "CAPTURE_VISIBLE_TAB") {
      const tab = sender.tab;
      if (!tab || typeof tab.windowId !== "number") {
        sendResponse(jsonResponse(false, { error: "No sender tab" }));
        return;
      }
      const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
      sendResponse(jsonResponse(true, { dataUrl }));
      return;
    }

    if (message?.type === "CAPTURE_CANVAS_REGION") {
      const tab = sender.tab;
      if (!tab || typeof tab.windowId !== "number") {
        sendResponse(jsonResponse(false, { error: "No sender tab" }));
        return;
      }

      const crop = message.crop || {};
      if (!Number.isFinite(crop.width) || !Number.isFinite(crop.height) || crop.width <= 0 || crop.height <= 0) {
        sendResponse(jsonResponse(false, { error: "Invalid crop area" }));
        return;
      }

      const fullDataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" });
      const dataUrl = await cropImageDataUrl(fullDataUrl, crop);
      sendResponse(jsonResponse(true, { dataUrl }));
      return;
    }

    if (message?.type === "GET_CURRENT_XML") {
      const tab = sender.tab;
      if (!tab?.id) {
        sendResponse(jsonResponse(false, { error: "No sender tab id" }));
        return;
      }
      const xml = await getCurrentXmlFromTab(tab.id);
      sendResponse(jsonResponse(true, { xml }));
      return;
    }

    if (message?.type === "INJECT_XML") {
      const tab = sender.tab;
      if (!tab?.id) {
        sendResponse(jsonResponse(false, { error: "No sender tab id" }));
        return;
      }
      const result = await injectXmlToTab(tab.id, message.xml || "");
      sendResponse(jsonResponse(true, { result }));
      return;
    }

    if (message?.type === "GENERATE_XML") {
      const result = await requestXmlFromLlm(message.payload || {});
      sendResponse(jsonResponse(true, result));
      return;
    }

    if (message?.type === "TEST_API") {
      const result = await testApiConnectivity(message.payload || {});
      sendResponse(jsonResponse(true, result));
      return;
    }
  })().catch((error) => {
    sendResponse(jsonResponse(false, { error: error?.message || String(error) }));
  });

  return true;
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) {
    return;
  }

  const targetUrl = String(tab.url || "");
  if (!targetUrl.startsWith("https://app.diagrams.net/")) {
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, { type: "OPEN_SIDEBAR" });
  } catch {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });

      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["content.css"]
      });

      await chrome.tabs.sendMessage(tab.id, { type: "OPEN_SIDEBAR" });
    } catch {
      // Ignore silently: user may be on an unsupported frame state.
    }
  }
});
