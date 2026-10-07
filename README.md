# 🔮 Prompt Wizard 2.0 | 晨曦詠唱精靈 · 跨領域宗師鑄造堡壘

> **彌合人類模糊需求與 AI 機器理解的鴻溝**  
> 透過召喚跨領域當代與歷史頂尖宗師進行思維辯論，將原始構想、上傳截圖與參考文件，鍛造為高精準度、具軍事級資安防禦且機器能完美執行的「終極 System Prompt」。

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-amber?style=for-the-badge&logo=github)](https://ajbearpluto.github.io/prompt-wizard/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Powered by Gemini](https://img.shields.io/badge/AI%20Engine-Gemini%203.5%20Flash-orange?style=for-the-badge&logo=google)](https://aistudio.google.com/)

---

## 🌟 核心革新亮點 (What's New in 2.0)

### 1. 🚨 告別 404 舊端點迷思：動態模型探測與自適應自愈降級 (Self-Healing Model Discovery)
- **拒絕盲人摸象**：系統開機或輸入 API Key 時，自動向 Google 官方端點 (`GET /v1beta/models`) 實時探測目前真正存活且開通之有效模型清單（支援 `gemini-3.5-flash`、`gemini-3.8-flash`、`gemini-3.1-flash-lite`、`gemini-flash-latest` 等）。
- **自適應防 404 自愈鏈**：若遇到端點更迭、404 Not Found 或高負載 503，系統自動捕捉異常並切換至下一個有效官方端點重試，杜絕程式碼「找不到大腦」而崩潰的歷史失誤！

### 2. 🪜 記憶階梯：頂級研發機構 AI 缺陷免疫進化系統 (Frontier AI Dilemmas Immunity Ladder)
- **拒絕脆弱的平面指令**：深入攻克當前 OpenAI、Anthropic、Google DeepMind 等頂級實驗室所面臨的五大本質 AI 難題，將相應宗師的免疫協議深層寫入 Prompt 的底層約束：
  - **🪜 階梯 L1 (認知防偽 · Epistemic Truth)**：攻克「流利幻覺」與「討好型迎合 (Sycophancy)」。注入 Google DeepMind CoVe (驗證鏈) 與卡尼曼認識論校準，知之為知之，主動糾正錯誤假設。
  - **🪜 階梯 L2 (脈絡守恆 · Context Invariance)**：攻克長文本「迷失在中間 (Lost-in-Middle)」與「目標漂移 (Goal Drift)」。注入維納反饋控制與狀態不變量槽 (State Scratchpad Invariant)。
  - **🪜 階梯 L3 (資安沙盒 · Zero-Trust Sandbox)**：攻克「間接提示注入 (Prompt Injection)」、「角色混淆」與「思維鏈偽造 (CoT Forgery)」。注入 Anthropic 標籤隔離與三明治防禦。
  - **🪜 階梯 L4 (因果慢思 · Causal Reasoning)**：攻克「相關性當因果」與「自我糾錯死循環 (Self-Correction Trap)」。注入 Judea Pearl 因果干預 (Do-Calculus & 反事實檢驗) 與慢思考分支檢驗。
  - **🪜 階梯 L5 (全時演進 · Perpetual Grounding)**：攻克「404 舊端點迷思」、「知識截斷」與「代碼庫棄用 (Deprecated)」。注入理查·費曼第一性原理、動態實時時間錨點與即時官方 API 驗證。
- **一鍵攀登深化**：點擊「**🧗 升級階梯**」，可選擇任一維度進行免疫注入，讓產出的法典自帶國際頂級實驗室級別的防禦抗體！

### 3. 🌐 全時動態時間軸聯網搜尋 (Real-Time Search Grounding with Temporal Anchor)
- **隨真實時間動態推進（非靜態年份）**：每次發起鍛造時，系統自動捕捉客戶端當下毫秒級時間戳記（例如 `2026-09-25 13:00`），作為「實時時間錨點 (Dynamic Real-Time Anchor)」注入提示詞。今天發問檢索今天最新，明天發問檢索明天最新！
- **杜絕認知滯後與過時套件**：AI 自動透過 Google Search Grounding 實時檢索此時此刻全球最新學術進展、arXiv 論文、新版函式庫重大發布 (Breaking Changes) 與已棄用 (Deprecated) 舊端點。
- **透明動態情資看板**：在成果面板頂部高亮展開【🌐 實時前沿學術與科技情資】，顯示檢索時間戳記、實際 Google 搜尋關鍵字與權威參考連結。

### 4. 📸 真正多模態深度解析 (Multimodal Parsing)
- **剪貼簿直接貼上 (Ctrl + V)**：截圖後直接在畫面貼上，立刻轉換為多模態 Base64 解析。
- **拖曳上傳 (Drag & Drop)**：支援圖片（PNG, JPG, WEBP）及各類文本/代碼檔案（TXT, MD, CSV, JSON, Python, JS, PDF 等）。

### 5. 🏰 軍事堡壘級資安防禦 (Cybersecurity & Injection Defense)
- **防 Prompt 注入攻擊 (Anti-Injection)**：強制使用 `<system_instructions>` 等語意隔離標籤。
- **反向工程抗性 (Anti-Reverse Engineering)**：防範使用者套問、解構底層提示詞。
- **敏感個資防護 (PII Protection)** 與輸出邊界鎖定 (Guardrails)。

### 6. 🏛️ 萬相圖書館分類典藏 (Omniverse Library)
- **智慧自動主題編目**：系統自動分析提問內容，分流歸檔至【💻 系統程式】、【🎨 語言翻譯】、【🌌 宗師法典】、【🧬 前沿科研】與【⭐ 珍品收藏】書架。
- **多詞交集與標籤檢索**：支援快速多關鍵字交集、前綴標籤（`#dev`、`#lang`、`#star`）與階梯層次篩選。
- **跨設備安全備份**：提供一鍵「📥 匯入」與「📤 匯出」圖書館 JSON 備份，終身典藏永不遺失。

### 7. 🩺 系統自我演進檢視與更新中樞 (Evolution Sentinel)
- **啟動自我體檢**：開啟網頁時自動核實 API 大腦端點存活度、Google 官方新世代推薦模型、圖書館備份健康度與時間軸同步狀態。
- **與時俱進升級提示**：當 Google 釋出更高智力的新模型、或圖書館需要備份時，頂部發光提示「💡 發現演進建議」，支援一鍵自動套用最佳化設定！

---

## 🚀 快速上手 (Quick Start)

### 線上即刻體驗 (推薦)
前往 [Prompt Wizard 線上版](https://ajbearpluto.github.io/prompt-wizard/)：
1. 點擊右上角「**能源設定**」，填入您的 [Google Gemini API Key](https://aistudio.google.com/app/apikey)（完全免費）。
2. 點擊「**🔍 重新探測可用端點**」，系統將自動同步 Google 官方最新活體模型。
3. 在輸入框中寫下您的構想，或直接按 `Ctrl + V` 貼上架構圖/截圖。
4. 選擇偏好的會診宗師與資安等級，按下「**✨ 召喚宗師會診 · 鍛造終極 Prompt**」（或快捷鍵 `Ctrl + Enter`）。
5. 點擊「**一鍵複製 Prompt**」或「**🧗 深化下一階**」沿著記憶階梯繼續演進！

---

## 📁 專案結構 (Architecture)

```text
prompt-wizard/
├── index.html          # 晨曦詠唱工坊主介面 (Tailwind CSS + Glassmorphism + 階梯導航)
├── js/
│   └── app.js          # 核心客戶端引擎 (動態模型探測、記憶階梯深化、聯網搜尋 Grounding)
└── README.md           # 專案說明文件
```

---

## 🔒 資安與隱私宣告

- 本工具完全尊重用戶隱私，在「直連模式」下，所有 API Key 與對話歷史僅保存在使用者的瀏覽器 `localStorage`，不會被上傳至任何未經授權的第三方伺服器。
- 產出的終極 System Prompt 均自帶邊界鎖定與防注入機制，杜絕目標 AI 脫軌。

---

## 📄 License

MIT License © 2026 Ajbearpluto & Commander.
