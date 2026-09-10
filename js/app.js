let state = {
    apiKey: localStorage.getItem('gemini_api_key') || '',
    idea: '',
    questions: [],
    promptHistory: JSON.parse(localStorage.getItem('prompt_wizard_history') || '[]')
};

window.onload = () => {
    console.log("📡 [系統日誌] 網頁載入完成，JS 引擎啟動成功！");
    if (!state.apiKey) toggleSettings();
    const keyInput = document.getElementById('apiKeyInput');
    if(keyInput) keyInput.value = state.apiKey;
    renderHistory();
};

function toggleSettings() {
    console.log("📡 [系統日誌] 開啟/關閉設定視窗");
    document.getElementById('settingsModal').classList.toggle('hidden');
}

function clearHistoryCache() {
    if(confirm("確定要清除所有歷史紀錄嗎？這可以解決 undefined 的顯示問題。")) {
        localStorage.removeItem('prompt_wizard_history');
        state.promptHistory = [];
        renderHistory();
        showToast('歷史紀錄已清除');
    }
}

function saveApiKey() {
    const key = document.getElementById('apiKeyInput').value.trim();
    if (key) {
        localStorage.setItem('gemini_api_key', key);
        state.apiKey = key;
        toggleSettings();
        showToast('API 金鑰已加密鎖定');
        console.log("📡 [系統日誌] 金鑰已成功更新！");
    } else {
        alert('請輸入有效的金鑰');
    }
}

function showLoading(text) {
    document.getElementById('loadingText').innerText = text;
    document.getElementById('loadingOverlay').classList.remove('hidden');
    document.getElementById('loadingOverlay').classList.add('flex');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
    document.getElementById('loadingOverlay').classList.remove('flex');
}

async function callGemini(prompt, isJsonMode = false) {
    console.log("📡 [系統日誌] 準備發送 API 請求...");
    if (!state.apiKey) {
        toggleSettings();
        throw new Error("Missing API Key");
    }

    // 💡 暫時退回最穩定的 v1beta 與 1.5-flash，確保最低限度能通訊
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.apiKey}`;

    let finalPrompt = prompt;
    if (isJsonMode) finalPrompt += `\n\n**CRITICAL: You MUST output ONLY valid JSON format. Do NOT wrap in markdown blockquotes like \`\`\`json. Just the raw JSON.**`;

    try {
        console.log("📡 [系統日誌] 正在連線 Google 伺服器...");
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: finalPrompt }] }],
                generationConfig: { temperature: 0.2 }
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error("🔴 [系統日誌] 伺服器回報錯誤：", errData);
            throw new Error(errData.error.message || 'API Error');
        }

        console.log("📡 [系統日誌] 成功接收 AI 回應！");
        const data = await response.json();
        let textResult = data.candidates[0].content.parts[0].text;
        if (isJsonMode) return JSON.parse(textResult.replace(/```json\n?/g, '').replace(/
