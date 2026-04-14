(function () {
  const SIDEBAR_ID = "drawio-ai-sidebar";
  const CONFIG_KEY = "drawioAiConfigV2";
  const HISTORY_KEY = "drawioAiHistory";
  const UI_LANGUAGE_OPTIONS = ["auto", "zh", "en"];

  function resolveLocale(uiLanguage) {
    if (uiLanguage === "zh" || uiLanguage === "en") {
      return uiLanguage;
    }
    return (navigator.language || "en").toLowerCase().startsWith("zh") ? "zh" : "en";
  }

  function normalizeUiLanguage(value) {
    return UI_LANGUAGE_OPTIONS.includes(value) ? value : "auto";
  }

  let locale = resolveLocale("auto");
  const i18n = {
    zh: {
      title: "AI Diagram Copilot",
      subtitle: "自然语言到流程图 · 多轮对话",
      settings: "设置",
      clearHistory: "清空历史",
      close: "关闭",
      uploadImage: "上传图片",
      captureAnnotate: "截屏并标注",
      promptPlaceholder: "描述你想新增或修改的流程，例如：新增风控审核节点，拒绝后回到人工复核",
      generateOnly: "仅生成",
      generateInject: "生成并注入",
      xmlPanel: "XML 面板",
      injectOutput: "注入上述 XML",
      getCurrentXml: "读取当前 XML",
      ready: "就绪",
      emptyHistory: "开始描述你想要的流程图，或上传图片辅助说明。",
      roleMe: "你",
      roleAi: "AI",
      generatedXml: "已生成 XML，长度 {len}",
      promptRequired: "请输入需求",
      configRequired: "请先配置当前 API 的 baseUrl 与 API Key",
      readingCanvas: "读取当前画布...",
      generating: "请求模型生成 XML...",
      generatedNoInject: "生成完成，尚未注入",
      injecting: "后台注入中...",
      injectSuccess: "注入成功，画布已更新",
      saveOk: "配置已保存",
      reloadOk: "配置已重载",
      clearHistoryOk: "历史已清空",
      xmlEmpty: "XML 为空",
      injectedOutput: "已注入 XML",
      currentXmlOk: "已读取当前 XML",
      uploadedOk: "参考图已上传",
      capturing: "正在截屏...",
      annotateHint: "请拖拽文字或涂鸦后点击完成",
      screenshotUpdated: "截图标注已更新",
      screenshotCleared: "图片上下文已清空",
      screenshotAreaMissing: "未找到 draw.io 画布区域，请先点击画布再重试",
      settingsTitle: "模型与参数设置",
      activeProfile: "当前 API 配置",
      profileNew: "新建",
      profileDelete: "删除",
      profileTest: "测试连接",
      profileName: "配置名称",
      uiLanguage: "界面语言",
      uiLanguageAuto: "自动（跟随浏览器）",
      uiLanguageZh: "中文",
      uiLanguageEn: "英文",
      baseUrl: "baseLLMUrl",
      apiKey: "API Key",
      temperature: "温度 temperature",
      maxTokens: "max_tokens",
      modelList: "模型列表 (每行一个)",
      reload: "重载",
      save: "保存设置",
      addTextPrompt: "输入标注文字",
      color: "颜色",
      lineWidth: "线宽",
      addText: "添加可拖拽文字",
      clearAnnotate: "清空标注",
      doneUse: "完成并使用",
      cancel: "取消",
      testRunning: "正在测试 API 连通性...",
      testOk: "API 连接测试通过",
      testFailed: "API 连接测试失败：{error}",
      screenshotFailed: "截屏失败",
      profileNeedOne: "至少保留一个配置",
      profileNameRequired: "配置名称不能为空"
    },
    en: {
      title: "AI Diagram Copilot",
      subtitle: "Natural language to diagram · multi-turn chat",
      settings: "Settings",
      clearHistory: "Clear history",
      close: "Close",
      uploadImage: "Upload image",
      captureAnnotate: "Capture + annotate",
      promptPlaceholder: "Describe what to add or modify in the flow, for example: add risk review node and route rejection to manual review",
      generateOnly: "Generate only",
      generateInject: "Generate and inject",
      xmlPanel: "XML Panel",
      injectOutput: "Inject XML above",
      getCurrentXml: "Read current XML",
      ready: "Ready",
      emptyHistory: "Describe your diagram needs, or upload an image as context.",
      roleMe: "You",
      roleAi: "AI",
      generatedXml: "Generated XML, length {len}",
      promptRequired: "Please enter your request",
      configRequired: "Please configure baseUrl and API key for the active API profile",
      readingCanvas: "Reading current canvas...",
      generating: "Requesting model XML...",
      generatedNoInject: "Generated, not injected yet",
      injecting: "Injecting in background...",
      injectSuccess: "Injected successfully, canvas updated",
      saveOk: "Configuration saved",
      reloadOk: "Configuration reloaded",
      clearHistoryOk: "History cleared",
      xmlEmpty: "XML is empty",
      injectedOutput: "XML injected",
      currentXmlOk: "Current XML loaded",
      uploadedOk: "Reference image uploaded",
      capturing: "Capturing screenshot...",
      annotateHint: "Annotate then click done",
      screenshotUpdated: "Annotated screenshot updated",
      screenshotCleared: "Image context cleared",
      screenshotAreaMissing: "draw.io canvas region not found, click canvas and retry",
      settingsTitle: "Model and Parameters",
      activeProfile: "Active API profile",
      profileNew: "New",
      profileDelete: "Delete",
      profileTest: "Test",
      profileName: "Profile name",
      uiLanguage: "UI language",
      uiLanguageAuto: "Auto (follow browser)",
      uiLanguageZh: "Chinese",
      uiLanguageEn: "English",
      baseUrl: "baseLLMUrl",
      apiKey: "API Key",
      temperature: "temperature",
      maxTokens: "max_tokens",
      modelList: "Model list (one per line)",
      reload: "Reload",
      save: "Save",
      addTextPrompt: "Enter annotation text",
      color: "Color",
      lineWidth: "Line width",
      addText: "Add draggable text",
      clearAnnotate: "Clear annotations",
      doneUse: "Done and use",
      cancel: "Cancel",
      testRunning: "Testing API connectivity...",
      testOk: "API connectivity test passed",
      testFailed: "API test failed: {error}",
      screenshotFailed: "Screenshot failed",
      profileNeedOne: "At least one profile must remain",
      profileNameRequired: "Profile name is required"
    }
  };

  function t(key, vars) {
    const dict = i18n[locale] || i18n.en;
    let text = dict[key] || i18n.en[key] || key;
    if (!vars) return text;
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    });
    return text;
  }

  function createProfile(seed) {
    const id = seed?.id || `profile-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    return {
      id,
      name: seed?.name || "Default",
      baseUrl: seed?.baseUrl || "",
      apiKey: seed?.apiKey || "",
      modelList: Array.isArray(seed?.modelList) && seed.modelList.length
        ? Array.from(new Set(seed.modelList.map((m) => String(m || "").trim()).filter(Boolean)))
        : ["gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1"]
    };
  }

  const defaultConfig = {
    profiles: [createProfile({ id: "default", name: "Default" })],
    activeProfileId: "default",
    uiLanguage: "auto",
    model: "gpt-4o-mini",
    temperature: 0.2,
    maxTokens: 4096
  };

  const state = {
    config: { ...defaultConfig },
    history: [],
    runtimeListenerBound: false,
    uploadedImageDataUrl: "",
    screenshotDataUrl: "",
    screenshotEditor: {
      annotations: [],
      dragTextId: null,
      drawingPathId: null,
      color: "#ef4444",
      lineWidth: 3,
      baseImage: null,
      ctx: null,
      canvas: null
    }
  };

  function sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response || { ok: false, error: "No response" });
      });
    });
  }

  function setStatus(text, isError) {
    const el = document.getElementById("drawio-ai-status");
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? "#991b1b" : "#155e75";
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getInput(id) {
    return document.getElementById(id);
  }

  function getActiveProfile() {
    const id = state.config.activeProfileId;
    const found = (state.config.profiles || []).find((p) => p.id === id);
    return found || state.config.profiles[0] || null;
  }

  function normalizeConfig(rawCfg) {
    const cfg = rawCfg || {};
    const migratedLegacyProfile = (cfg.baseUrl || cfg.apiKey)
      ? [createProfile({
          id: "legacy",
          name: locale === "zh" ? "默认配置" : "Default",
          baseUrl: cfg.baseUrl || "",
          apiKey: cfg.apiKey || "",
          modelList: cfg.modelList
        })]
      : [];

    const profiles = Array.isArray(cfg.profiles) && cfg.profiles.length
      ? cfg.profiles.map((p) => createProfile(p))
      : migratedLegacyProfile.length
        ? migratedLegacyProfile
        : defaultConfig.profiles.map((p) => createProfile(p));

    const activeProfileId = profiles.some((p) => p.id === cfg.activeProfileId)
      ? cfg.activeProfileId
      : profiles[0].id;

    const modelFromCfg = String(cfg.model || "").trim();
    const model = modelFromCfg || profiles[0].modelList[0] || "gpt-4o-mini";
    const uiLanguage = normalizeUiLanguage(String(cfg.uiLanguage || "auto").trim());

    return {
      profiles,
      activeProfileId,
      uiLanguage,
      model,
      temperature: Number.isFinite(Number(cfg.temperature)) ? Number(cfg.temperature) : defaultConfig.temperature,
      maxTokens: Number.isFinite(Number(cfg.maxTokens)) ? Number(cfg.maxTokens) : defaultConfig.maxTokens
    };
  }

  function updateProfileFields(profile) {
    if (!profile) return;
    getInput("drawio-ai-profile-name").value = profile.name || "";
    getInput("drawio-ai-base-url").value = profile.baseUrl || "";
    getInput("drawio-ai-api-key").value = profile.apiKey || "";
    getInput("drawio-ai-model-list").value = (profile.modelList || []).join("\n");
  }

  function readProfileFields(profile) {
    const p = profile;
    p.name = String(getInput("drawio-ai-profile-name").value || "").trim();
    p.baseUrl = String(getInput("drawio-ai-base-url").value || "").trim();
    p.apiKey = String(getInput("drawio-ai-api-key").value || "").trim();
    const modelListRaw = String(getInput("drawio-ai-model-list").value || "").trim();
    const parsedModels = modelListRaw
      .split(/\n|,/) 
      .map((x) => x.trim())
      .filter(Boolean);
    p.modelList = parsedModels.length ? Array.from(new Set(parsedModels)) : ["gpt-4o-mini"];
  }

  function syncActiveProfileFromModal() {
    const select = getInput("drawio-ai-profile-select");
    const profile = (state.config.profiles || []).find((p) => p.id === select.value);
    if (!profile) return null;
    readProfileFields(profile);
    if (!profile.name) {
      throw new Error(t("profileNameRequired"));
    }
    state.config.activeProfileId = profile.id;
    return profile;
  }

  function renderProfileOptions() {
    const select = getInput("drawio-ai-profile-select");
    if (!select) return;

    select.innerHTML = (state.config.profiles || [])
      .map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name || "Unnamed")}</option>`)
      .join("");

    const active = getActiveProfile();
    if (active) {
      select.value = active.id;
      updateProfileFields(active);
    }
  }

  function clearImageContext() {
    state.uploadedImageDataUrl = "";
    state.screenshotDataUrl = "";

    const uploadPreview = getInput("drawio-ai-upload-preview");
    const shotPreview = getInput("drawio-ai-shot-preview");
    const uploadInput = getInput("drawio-ai-upload");

    if (uploadPreview) {
      uploadPreview.src = "";
      uploadPreview.style.display = "none";
    }

    if (shotPreview) {
      shotPreview.src = "";
      shotPreview.style.display = "none";
    }

    if (uploadInput) {
      uploadInput.value = "";
    }
  }

  function renderApiTestResult(kind, text) {
    const btn = getInput("drawio-ai-profile-test");
    const result = getInput("drawio-ai-profile-test-result");

    if (btn) {
      btn.classList.remove("is-pending", "is-success", "is-error");
      if (kind === "pending") btn.classList.add("is-pending");
      if (kind === "success") btn.classList.add("is-success");
      if (kind === "error") btn.classList.add("is-error");
    }

    if (result) {
      result.classList.remove("pending", "success", "error");
      if (kind === "pending") result.classList.add("pending");
      if (kind === "success") result.classList.add("success");
      if (kind === "error") result.classList.add("error");
      result.textContent = text || "";
      result.style.display = text ? "block" : "none";
    }
  }

  async function saveConfig() {
    const oldLocale = locale;
    syncActiveProfileFromModal();
    state.config.uiLanguage = normalizeUiLanguage(String(getInput("drawio-ai-ui-language")?.value || "auto").trim());
    locale = resolveLocale(state.config.uiLanguage);
    state.config.model = (getInput("drawio-ai-model-select").value || "").trim() || "gpt-4o-mini";
    state.config.temperature = Number(getInput("drawio-ai-temperature").value || 0.2);
    state.config.maxTokens = Number(getInput("drawio-ai-max-tokens").value || 4096);

    await chrome.storage.local.set({ [CONFIG_KEY]: state.config });

    if (oldLocale !== locale) {
      remountUi();
      return { languageChanged: true };
    }

    renderProfileOptions();
    renderModelOptions();
    setStatus(t("saveOk"), false);
    return { languageChanged: false };
  }

  async function loadConfig() {
    const data = await chrome.storage.local.get([CONFIG_KEY, "drawioAiConfig"]);
    const cfg = normalizeConfig(data[CONFIG_KEY] || data.drawioAiConfig || {});
    state.config = { ...defaultConfig, ...cfg };
    locale = resolveLocale(state.config.uiLanguage);

    getInput("drawio-ai-temperature").value = String(state.config.temperature);
    getInput("drawio-ai-max-tokens").value = String(state.config.maxTokens);
    const uiLangInput = getInput("drawio-ai-ui-language");
    if (uiLangInput) {
      uiLangInput.value = state.config.uiLanguage;
    }

    renderProfileOptions();
    renderModelOptions();
  }

  function renderModelOptions() {
    const select = getInput("drawio-ai-model-select");
    const active = getActiveProfile();
    const current = state.config.model || "gpt-4o-mini";

    const profileModels = Array.isArray(active?.modelList) ? active.modelList : [];
    const models = Array.from(new Set([...profileModels, current])).filter(Boolean);
    const safeModels = models.length ? models : ["gpt-4o-mini"];

    select.innerHTML = safeModels
      .map((m) => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`)
      .join("");
    select.value = safeModels.includes(current) ? current : safeModels[0];
    state.config.model = select.value;
  }

  async function saveHistory() {
    const clipped = state.history.slice(-30);
    state.history = clipped;
    await chrome.storage.local.set({ [HISTORY_KEY]: clipped });
  }

  async function loadHistory() {
    const data = await chrome.storage.local.get([HISTORY_KEY]);
    state.history = Array.isArray(data[HISTORY_KEY]) ? data[HISTORY_KEY] : [];
    renderHistory();
  }

  async function clearHistory() {
    state.history = [];
    await chrome.storage.local.set({ [HISTORY_KEY]: [] });
    renderHistory();
    setStatus(t("clearHistoryOk"), false);
  }

  function appendHistory(item) {
    state.history.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      ts: Date.now(),
      ...item
    });
    renderHistory();
    saveHistory().catch(() => {});
  }

  function renderHistory() {
    const list = getInput("drawio-ai-chat-list");
    if (!list) return;

    if (!state.history.length) {
      list.innerHTML = `<div class="drawio-ai-empty">${escapeHtml(t("emptyHistory"))}</div>`;
      return;
    }

    list.innerHTML = state.history
      .map((msg) => {
        const roleCls = msg.role === "assistant" ? "assistant" : "user";
        const body = msg.role === "assistant" && msg.xml
          ? t("generatedXml", { len: msg.xml.length })
          : (msg.text || "");
        const tsDate = new Date(msg.ts || Date.now());
        const tsText = `${String(tsDate.getHours()).padStart(2, "0")}:${String(tsDate.getMinutes()).padStart(2, "0")}`;

        return `
          <div class="drawio-ai-msg ${roleCls}">
            <div class="drawio-ai-msg-meta">${msg.role === "assistant" ? t("roleAi") : t("roleMe")} · ${tsText}</div>
            <div class="drawio-ai-msg-body">${escapeHtml(body)}</div>
          </div>
        `;
      })
      .join("");

    list.scrollTop = list.scrollHeight;
  }

  async function getCurrentXml() {
    const resp = await sendMessage({ type: "GET_CURRENT_XML" });
    if (!resp.ok) throw new Error(resp.error || "读取当前 XML 失败");
    return resp.xml || "";
  }

  async function injectXml(xml) {
    const payload = (xml || "").trim();
    if (!payload) throw new Error(t("xmlEmpty"));

    const resp = await sendMessage({ type: "INJECT_XML", xml: payload });
    if (!resp.ok) throw new Error(resp.error || "注入失败");
    return resp.result;
  }

  function pickImageDataUrl() {
    return state.screenshotDataUrl || state.uploadedImageDataUrl || "";
  }

  function getHistoryForModel() {
    return state.history.slice(-12).map((item) => ({
      role: item.role,
      text: item.text || "",
      xml: item.xml || ""
    }));
  }

  async function runGeneration(injectAfter) {
    const prompt = (getInput("drawio-ai-prompt-input").value || "").trim();
    if (!prompt) {
      setStatus(t("promptRequired"), true);
      return;
    }

    state.config.model = (getInput("drawio-ai-model-select").value || "").trim() || "gpt-4o-mini";
    const activeProfile = getActiveProfile();

    const cfg = {
      baseUrl: (activeProfile?.baseUrl || "").trim(),
      apiKey: (activeProfile?.apiKey || "").trim(),
      model: (getInput("drawio-ai-model-select").value || "").trim(),
      temperature: Number(getInput("drawio-ai-temperature").value || 0.2),
      maxTokens: Number(getInput("drawio-ai-max-tokens").value || 4096)
    };

    if (!cfg.baseUrl || !cfg.apiKey) {
      setStatus(t("configRequired"), true);
      return;
    }

    const historyForModel = getHistoryForModel();

    appendHistory({ role: "user", text: prompt });
    getInput("drawio-ai-prompt-input").value = "";

    setStatus(t("readingCanvas"), false);
    const currentXml = await getCurrentXml();

    setStatus(t("generating"), false);
    const imageDataUrl = pickImageDataUrl();
    const generateResp = await sendMessage({
      type: "GENERATE_XML",
      payload: {
        ...cfg,
        userPrompt: prompt,
        currentXml,
        imageDataUrl,
        history: historyForModel
      }
    });

    if (!generateResp.ok) {
      throw new Error(generateResp.error || "生成失败");
    }

    const xml = (generateResp.xml || "").trim();
    getInput("drawio-ai-output").value = xml;
    appendHistory({ role: "assistant", text: t("generatedXml", { len: xml.length }), xml });

    if (imageDataUrl) {
      clearImageContext();
    }

    if (!injectAfter) {
      setStatus(t("generatedNoInject"), false);
      return;
    }

    setStatus(t("injecting"), false);
    await injectXml(xml);
    setStatus(t("injectSuccess"), false);
  }

  function buildSidebarHtml() {
    return `
      <div class="drawio-ai-head">
        <div class="drawio-ai-brand">
          <h2 class="drawio-ai-title">${escapeHtml(t("title"))}</h2>
          <div class="drawio-ai-sub">${escapeHtml(t("subtitle"))}</div>
        </div>
        <div class="drawio-ai-head-actions">
          <select id="drawio-ai-model-select" class="drawio-ai-model-pill"></select>
          <button class="drawio-ai-icon-btn" id="drawio-ai-open-settings" title="${escapeHtml(t("settings"))}" type="button">⚙</button>
          <button class="drawio-ai-icon-btn" id="drawio-ai-clear-history" title="${escapeHtml(t("clearHistory"))}" type="button">⌫</button>
          <button class="drawio-ai-icon-btn" id="drawio-ai-close" title="${escapeHtml(t("close"))}" type="button">×</button>
        </div>
      </div>

      <div id="drawio-ai-chat-list" class="drawio-ai-chat-list"></div>

      <div class="drawio-ai-context-strip">
        <label class="drawio-ai-upload-chip">
          ${escapeHtml(t("uploadImage"))}
          <input id="drawio-ai-upload" type="file" accept="image/*" hidden />
        </label>
        <button class="drawio-ai-upload-chip" id="drawio-ai-capture" type="button">${escapeHtml(t("captureAnnotate"))}</button>
      </div>

      <div class="drawio-ai-preview-row">
        <img id="drawio-ai-upload-preview" class="drawio-ai-preview" style="display:none" />
        <img id="drawio-ai-shot-preview" class="drawio-ai-preview" style="display:none" />
      </div>

      <div class="drawio-ai-composer">
        <textarea id="drawio-ai-prompt-input" class="drawio-ai-prompt" placeholder="${escapeHtml(t("promptPlaceholder"))}"></textarea>
        <div class="drawio-ai-composer-actions">
          <button class="drawio-ai-btn secondary" id="drawio-ai-generate-only" type="button">${escapeHtml(t("generateOnly"))}</button>
          <button class="drawio-ai-btn" id="drawio-ai-generate-inject" type="button">${escapeHtml(t("generateInject"))}</button>
        </div>
      </div>

      <details class="drawio-ai-xml-panel">
        <summary>${escapeHtml(t("xmlPanel"))}</summary>
        <textarea id="drawio-ai-output" class="drawio-ai-output"></textarea>
        <div class="drawio-ai-composer-actions" style="margin-top:8px">
          <button class="drawio-ai-btn secondary" id="drawio-ai-inject-output" type="button">${escapeHtml(t("injectOutput"))}</button>
          <button class="drawio-ai-btn secondary" id="drawio-ai-get-current" type="button">${escapeHtml(t("getCurrentXml"))}</button>
        </div>
      </details>

      <div id="drawio-ai-status" class="drawio-ai-status">${escapeHtml(t("ready"))}</div>
    `;
  }

  function buildSettingsModal() {
    const modal = document.createElement("div");
    modal.id = "drawio-ai-settings-modal";
    modal.innerHTML = `
      <div class="drawio-ai-settings-panel">
        <div class="drawio-ai-settings-head">
          <h3>${escapeHtml(t("settingsTitle"))}</h3>
          <button id="drawio-ai-settings-close" class="drawio-ai-icon-btn" type="button">×</button>
        </div>

        <label class="drawio-ai-label">${escapeHtml(t("activeProfile"))}</label>
        <div class="drawio-ai-composer-actions" style="margin-top:0">
          <select id="drawio-ai-profile-select" class="drawio-ai-input"></select>
          <button class="drawio-ai-btn secondary" id="drawio-ai-profile-new" type="button">${escapeHtml(t("profileNew"))}</button>
          <button class="drawio-ai-btn secondary" id="drawio-ai-profile-delete" type="button">${escapeHtml(t("profileDelete"))}</button>
          <button class="drawio-ai-btn secondary" id="drawio-ai-profile-test" type="button">${escapeHtml(t("profileTest"))}</button>
        </div>
        <div id="drawio-ai-profile-test-result" class="drawio-ai-test-result" style="display:none"></div>

        <label class="drawio-ai-label">${escapeHtml(t("profileName"))}</label>
        <input id="drawio-ai-profile-name" class="drawio-ai-input" placeholder="prod-us / local-dev / ..." />

        <label class="drawio-ai-label">${escapeHtml(t("uiLanguage"))}</label>
        <select id="drawio-ai-ui-language" class="drawio-ai-input">
          <option value="auto">${escapeHtml(t("uiLanguageAuto"))}</option>
          <option value="zh">${escapeHtml(t("uiLanguageZh"))}</option>
          <option value="en">${escapeHtml(t("uiLanguageEn"))}</option>
        </select>

        <label class="drawio-ai-label">${escapeHtml(t("baseUrl"))}</label>
        <input id="drawio-ai-base-url" class="drawio-ai-input" placeholder="https://api.example.com/v1" />

        <label class="drawio-ai-label">${escapeHtml(t("apiKey"))}</label>
        <input id="drawio-ai-api-key" class="drawio-ai-input" type="password" placeholder="sk-..." />

        <label class="drawio-ai-label">${escapeHtml(t("temperature"))}</label>
        <input id="drawio-ai-temperature" class="drawio-ai-input" type="number" min="0" max="2" step="0.1" />

        <label class="drawio-ai-label">${escapeHtml(t("maxTokens"))}</label>
        <input id="drawio-ai-max-tokens" class="drawio-ai-input" type="number" min="256" max="16384" step="128" />

        <label class="drawio-ai-label">${escapeHtml(t("modelList"))}</label>
        <textarea id="drawio-ai-model-list" class="drawio-ai-output" style="min-height:120px"></textarea>

        <div class="drawio-ai-composer-actions">
          <button class="drawio-ai-btn secondary" id="drawio-ai-settings-reload" type="button">${escapeHtml(t("reload"))}</button>
          <button class="drawio-ai-btn" id="drawio-ai-settings-save" type="button">${escapeHtml(t("save"))}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  function buildScreenshotEditorModal() {
    const modal = document.createElement("div");
    modal.id = "drawio-ai-editor-modal";
    modal.innerHTML = `
      <div class="drawio-ai-editor-panel">
        <div class="drawio-ai-editor-toolbar">
          <label>${escapeHtml(t("color"))}</label>
          <input type="color" id="drawio-ai-editor-color" value="#ef4444" />
          <label>${escapeHtml(t("lineWidth"))}</label>
          <input type="range" id="drawio-ai-editor-width" min="1" max="16" value="3" />
          <button class="drawio-ai-btn secondary" id="drawio-ai-editor-add-text" type="button">${escapeHtml(t("addText"))}</button>
          <button class="drawio-ai-btn secondary" id="drawio-ai-editor-clear" type="button">${escapeHtml(t("clearAnnotate"))}</button>
          <button class="drawio-ai-btn" id="drawio-ai-editor-done" type="button">${escapeHtml(t("doneUse"))}</button>
          <button class="drawio-ai-btn secondary" id="drawio-ai-editor-cancel" type="button">${escapeHtml(t("cancel"))}</button>
        </div>
        <div id="drawio-ai-editor-canvas-wrap">
          <canvas id="drawio-ai-editor-canvas"></canvas>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  function setupScreenshotEditor(modal) {
    const canvas = modal.querySelector("#drawio-ai-editor-canvas");
    const ctx = canvas.getContext("2d");
    state.screenshotEditor.canvas = canvas;
    state.screenshotEditor.ctx = ctx;

    function screenToCanvas(e) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      return { x, y };
    }

    function drawPath(path) {
      if (!path.points.length) return;
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i += 1) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    }

    function drawText(textAnn) {
      ctx.fillStyle = textAnn.color;
      ctx.font = "24px sans-serif";
      ctx.fillText(textAnn.text, textAnn.x, textAnn.y);
    }

    function redraw() {
      const img = state.screenshotEditor.baseImage;
      if (!img) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      for (const ann of state.screenshotEditor.annotations) {
        if (ann.type === "path") drawPath(ann);
        if (ann.type === "text") drawText(ann);
      }
    }

    function hitText(x, y) {
      for (let i = state.screenshotEditor.annotations.length - 1; i >= 0; i -= 1) {
        const ann = state.screenshotEditor.annotations[i];
        if (ann.type !== "text") continue;
        ctx.font = "24px sans-serif";
        const w = ctx.measureText(ann.text).width;
        const h = 28;
        if (x >= ann.x && x <= ann.x + w && y <= ann.y && y >= ann.y - h) {
          return ann;
        }
      }
      return null;
    }

    function openWithImage(dataUrl) {
      const img = new Image();
      img.onload = () => {
        state.screenshotEditor.baseImage = img;
        state.screenshotEditor.annotations = [];
        state.screenshotEditor.dragTextId = null;
        state.screenshotEditor.drawingPathId = null;

        canvas.width = img.width;
        canvas.height = img.height;
        redraw();
        modal.classList.add("open");
      };
      img.src = dataUrl;
    }

    canvas.addEventListener("pointerdown", (e) => {
      const p = screenToCanvas(e);
      const textTarget = hitText(p.x, p.y);
      if (textTarget) {
        state.screenshotEditor.dragTextId = textTarget.id;
        return;
      }

      const path = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        type: "path",
        color: state.screenshotEditor.color,
        lineWidth: state.screenshotEditor.lineWidth,
        points: [p]
      };
      state.screenshotEditor.annotations.push(path);
      state.screenshotEditor.drawingPathId = path.id;
      canvas.setPointerCapture(e.pointerId);
      redraw();
    });

    canvas.addEventListener("pointermove", (e) => {
      const p = screenToCanvas(e);

      if (state.screenshotEditor.dragTextId) {
        const ann = state.screenshotEditor.annotations.find((x) => x.id === state.screenshotEditor.dragTextId);
        if (!ann) return;
        ann.x = p.x;
        ann.y = p.y;
        redraw();
        return;
      }

      if (!state.screenshotEditor.drawingPathId) return;
      const path = state.screenshotEditor.annotations.find((x) => x.id === state.screenshotEditor.drawingPathId);
      if (!path) return;
      path.points.push(p);
      redraw();
    });

    function stopPointerMode() {
      state.screenshotEditor.dragTextId = null;
      state.screenshotEditor.drawingPathId = null;
    }

    canvas.addEventListener("pointerup", stopPointerMode);
    canvas.addEventListener("pointercancel", stopPointerMode);

    modal.querySelector("#drawio-ai-editor-color").addEventListener("input", (e) => {
      state.screenshotEditor.color = e.target.value;
    });

    modal.querySelector("#drawio-ai-editor-width").addEventListener("input", (e) => {
      state.screenshotEditor.lineWidth = Number(e.target.value || 3);
    });

    modal.querySelector("#drawio-ai-editor-add-text").addEventListener("click", () => {
      const text = window.prompt(t("addTextPrompt"));
      if (!text) return;
      state.screenshotEditor.annotations.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        type: "text",
        text,
        color: state.screenshotEditor.color,
        x: 40,
        y: 40
      });
      redraw();
    });

    modal.querySelector("#drawio-ai-editor-clear").addEventListener("click", () => {
      state.screenshotEditor.annotations = [];
      redraw();
    });

    modal.querySelector("#drawio-ai-editor-cancel").addEventListener("click", () => {
      modal.classList.remove("open");
    });

    modal.querySelector("#drawio-ai-editor-done").addEventListener("click", () => {
      state.screenshotDataUrl = canvas.toDataURL("image/png");
      const preview = getInput("drawio-ai-shot-preview");
      preview.src = state.screenshotDataUrl;
      preview.style.display = "block";
      modal.classList.remove("open");
      setStatus(t("screenshotUpdated"), false);
    });

    return { openWithImage };
  }

  function getCanvasCropArea() {
    const tryGetRectFromUi = () => {
      try {
        const ui = window.ui || window.editorUi || (window.EditorUi && window.EditorUi.currentUi);
        const rect = ui?.editor?.graph?.container?.getBoundingClientRect?.();
        if (rect && rect.width > 0 && rect.height > 0) {
          return rect;
        }
      } catch {
        return null;
      }
      return null;
    };

    const rect = tryGetRectFromUi()
      || document.querySelector(".mxGraphContainer")?.getBoundingClientRect?.()
      || document.querySelector(".geDiagramContainer")?.getBoundingClientRect?.();

    if (!rect || rect.width <= 0 || rect.height <= 0) {
      return null;
    }

    const x = Math.max(0, rect.left);
    const y = Math.max(0, rect.top);
    const right = Math.min(window.innerWidth, rect.right);
    const bottom = Math.min(window.innerHeight, rect.bottom);
    const width = Math.max(1, right - x);
    const height = Math.max(1, bottom - y);

    return {
      x,
      y,
      width,
      height,
      dpr: window.devicePixelRatio || 1
    };
  }

  function remountUi() {
    const sidebarWasOpen = document.getElementById(SIDEBAR_ID)?.classList.contains("open");
    const settingsWasOpen = document.getElementById("drawio-ai-settings-modal")?.classList.contains("open");

    const ids = [SIDEBAR_ID, "drawio-ai-settings-modal", "drawio-ai-editor-modal"];
    ids.forEach((id) => {
      const node = document.getElementById(id);
      if (node) {
        node.remove();
      }
    });

    mount();

    if (sidebarWasOpen) {
      const sidebar = document.getElementById(SIDEBAR_ID);
      if (sidebar) {
        sidebar.classList.add("open");
      }
    }

    if (settingsWasOpen) {
      const settings = document.getElementById("drawio-ai-settings-modal");
      if (settings) {
        settings.classList.add("open");
      }
    }
  }

  function bindRuntimeMessageListener() {
    if (state.runtimeListenerBound) {
      return;
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message?.type !== "OPEN_SIDEBAR") {
        return false;
      }

      const sidebar = document.getElementById(SIDEBAR_ID);
      if (sidebar) {
        sidebar.classList.add("open");
        sendResponse({ ok: true });
        return true;
      }

      sendResponse({ ok: false, error: "Sidebar not mounted" });
      return true;
    });

    state.runtimeListenerBound = true;
  }

  function mount() {
    if (document.getElementById(SIDEBAR_ID)) {
      return;
    }

    bindRuntimeMessageListener();

    const sidebar = document.createElement("aside");
    sidebar.id = SIDEBAR_ID;
    sidebar.innerHTML = buildSidebarHtml();

    document.body.appendChild(sidebar);

    const settingsModal = buildSettingsModal();
    const screenshotModal = buildScreenshotEditorModal();
    const screenshotEditor = setupScreenshotEditor(screenshotModal);

    getInput("drawio-ai-close").addEventListener("click", () => sidebar.classList.remove("open"));

    getInput("drawio-ai-open-settings").addEventListener("click", () => {
      settingsModal.classList.add("open");
    });

    getInput("drawio-ai-settings-close").addEventListener("click", () => {
      settingsModal.classList.remove("open");
    });

    getInput("drawio-ai-settings-save").addEventListener("click", async () => {
      try {
        const result = await saveConfig();
        if (!result?.languageChanged) {
          settingsModal.classList.remove("open");
        }
      } catch (e) {
        setStatus(e.message, true);
      }
    });

    getInput("drawio-ai-profile-select").addEventListener("change", (e) => {
      const selected = (state.config.profiles || []).find((p) => p.id === e.target.value);
      if (!selected) return;
      state.config.activeProfileId = selected.id;
      updateProfileFields(selected);
      renderModelOptions();
      renderApiTestResult("neutral", "");
    });

    getInput("drawio-ai-profile-new").addEventListener("click", () => {
      const next = createProfile({ name: locale === "zh" ? "新配置" : "New profile" });
      state.config.profiles.push(next);
      state.config.activeProfileId = next.id;
      renderProfileOptions();
      renderModelOptions();
      renderApiTestResult("neutral", "");
    });

    getInput("drawio-ai-profile-delete").addEventListener("click", () => {
      if ((state.config.profiles || []).length <= 1) {
        setStatus(t("profileNeedOne"), true);
        return;
      }
      const active = getActiveProfile();
      state.config.profiles = state.config.profiles.filter((p) => p.id !== active.id);
      state.config.activeProfileId = state.config.profiles[0].id;
      renderProfileOptions();
      renderModelOptions();
      renderApiTestResult("neutral", "");
    });

    getInput("drawio-ai-profile-test").addEventListener("click", async () => {
      try {
        const profile = syncActiveProfileFromModal();
        renderApiTestResult("pending", t("testRunning"));
        setStatus(t("testRunning"), false);
        const testResp = await sendMessage({
          type: "TEST_API",
          payload: {
            baseUrl: profile.baseUrl,
            apiKey: profile.apiKey,
            model: state.config.model || "gpt-4o-mini"
          }
        });
        if (!testResp.ok) {
          throw new Error(testResp.error || "Unknown error");
        }
        renderApiTestResult("success", t("testOk"));
        setStatus(t("testOk"), false);
      } catch (e) {
        const errMsg = t("testFailed", { error: e.message || String(e) });
        renderApiTestResult("error", errMsg);
        setStatus(errMsg, true);
      }
    });

    getInput("drawio-ai-settings-reload").addEventListener("click", () => {
      loadConfig()
        .then(() => {
          renderApiTestResult("neutral", "");
          setStatus(t("reloadOk"), false);
        })
        .catch((e) => setStatus(e.message, true));
    });

    getInput("drawio-ai-clear-history").addEventListener("click", () => {
      clearHistory().catch((e) => setStatus(e.message, true));
    });

    getInput("drawio-ai-generate-inject").addEventListener("click", () => {
      runGeneration(true).catch((e) => setStatus(e.message, true));
    });

    getInput("drawio-ai-generate-only").addEventListener("click", () => {
      runGeneration(false).catch((e) => setStatus(e.message, true));
    });

    getInput("drawio-ai-inject-output").addEventListener("click", () => {
      const xml = (getInput("drawio-ai-output").value || "").trim();
      if (!xml) {
        setStatus(t("xmlEmpty"), true);
        return;
      }
      injectXml(xml).then(() => setStatus(t("injectedOutput"), false)).catch((e) => setStatus(e.message, true));
    });

    getInput("drawio-ai-get-current").addEventListener("click", () => {
      getCurrentXml()
        .then((xml) => {
          getInput("drawio-ai-output").value = xml;
          setStatus(t("currentXmlOk"), false);
        })
        .catch((e) => setStatus(e.message, true));
    });

    getInput("drawio-ai-upload").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        state.uploadedImageDataUrl = String(reader.result || "");
        const preview = getInput("drawio-ai-upload-preview");
        preview.src = state.uploadedImageDataUrl;
        preview.style.display = "block";
        setStatus(t("uploadedOk"), false);
      };
      reader.readAsDataURL(file);
    });

    getInput("drawio-ai-capture").addEventListener("click", async () => {
      try {
        const crop = getCanvasCropArea();
        if (!crop) {
          setStatus(t("screenshotAreaMissing"), true);
          return;
        }

        setStatus(t("capturing"), false);
        const resp = await sendMessage({ type: "CAPTURE_CANVAS_REGION", crop });
        if (!resp.ok) {
          throw new Error(resp.error || t("screenshotFailed"));
        }
        screenshotEditor.openWithImage(resp.dataUrl);
        setStatus(t("annotateHint"), false);
      } catch (e) {
        setStatus(e.message, true);
      }
    });

    Promise.all([loadConfig(), loadHistory()])
      .then(() => {
        setStatus(t("ready"), false);
      })
      .catch((e) => setStatus(e.message, true));
  }

  mount();
})();
