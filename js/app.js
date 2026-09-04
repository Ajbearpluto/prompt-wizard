let state = {
    apiKey: localStorage.getItem('gemini_api_key') || '',
    idea: '',
    questions: [],
    promptHistory: JSON.parse(localStorage.getItem('prompt_wizard_history') || '[]')
};

window.onload = () => {
    if (!state.apiKey) toggleSettings();
    document.getElementById('apiKeyInput').value = state.apiKey;
    renderHistory();
};

function toggleSettings() { document.getElementById('settingsModal').classList.toggle('hidden'); }

// 解決舊版 localStorage 造成的 undefined 錯誤
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

// --- API 引擎核心 ---
async function callGemini(prompt, isJsonMode = false) {
    if (!state.apiKey) {
        toggleSettings();
        throw new Error("Missing API Key");
    }
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${state.apiKey}`;
    let finalPrompt = prompt;
    if (isJsonMode) finalPrompt += `\n\n**CRITICAL: You MUST output ONLY valid JSON format. Do NOT wrap in markdown blockquotes like \`\`\`json. Just the raw JSON.**`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: finalPrompt }] }],
                generationConfig: { temperature: 0.2 }
            })
        });
        if (!response.ok) throw new Error((await response.json()).error.message || 'API Error');
        const data = await response.json();
        let textResult = data.candidates[0].content.parts[0].text;
        if (isJsonMode) return JSON.parse(textResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
        return textResult;
    } catch (error) {
        alert("通訊干擾：" + error.message);
        throw error;
    }
}

// --- 核心轉譯邏輯 ---
async function startConsultation() {
    const idea = document.getElementById('ideaInput').value.trim();
    if (!idea) return alert("指揮官，請先輸入您的構想！");
    state.idea = idea;
    
    showLoading("☀️ 零一與宗師聯合會診中，拆解您的構想邊界...");
    
    const prompt = `使用者想開發的專案構想：「${idea}」。\n請模擬包含「🤖 零一 (副指揮官)」、「🧠 Claude 3.5 Sonnet」、「🍎 史蒂夫·賈伯斯」等頂尖智囊團，針對此專案提出【3 到 4 個最致命、最能釐清開發規格】的核心提問。\n【角色規範】：零一必須以「【零一 (副指揮官)】：報告指揮官！」開頭，展現邏輯統籌視角。其他大師依其特長發問。\n格式必須是 JSON 陣列字串。\n範例：["【零一 (副指揮官)】：報告指揮官！資料流存在盲區，請問系統需要具備外部 API 獲取資料能力嗎？"]`;

    try {
        state.questions = await callGemini(prompt, true);
        
        document.getElementById('state-input').classList.add('hidden');
        document.getElementById('state-consult').classList.remove('hidden');
        
        const qContainer = document.getElementById('questionsContainer');
        qContainer.innerHTML = '';
        state.questions.forEach((q, index) => {
            // 【修復核心】：明亮主題的提問卡片！深灰色文字與淺色輸入框
            qContainer.innerHTML += `
                <div class="bg-white/80 p-6 rounded-2xl border border-amber-100 border-l-4 border-l-amber-500 shadow-md">
                    <label class="block font-bold text-slate-800 mb-4 text-base leading-relaxed tracking-wide">
                        <span class="text-amber-600 mr-2 text-lg">Q${index + 1}.</span>${q}
                    </label>
                    <textarea id="answer-${index}" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-sm transition placeholder-slate-400 shadow-inner" placeholder="請指揮官輸入決策 (或留空交由系統預設)..."></textarea>
                </div>`;
        });
        hideLoading();
    } catch (e) { hideLoading(); }
}

async function forgeUltimatePrompt() {
    let qaContext = "";
    for (let i = 0; i < state.questions.length; i++) {
        const ans = document.getElementById(`answer-${i}`).value.trim() || '無特別限制，請大師提供最佳實踐。';
        qaContext += `Q: ${state.questions[i]}\nA: ${ans}\n\n`;
    }
    showLoading("✨ 零一正在統合大師見解，轉譯為 AI 終極詠唱...");

    const prompt = `你現在是頂尖的 AI 提示詞工程師(Prompt Engineer)。\n【原始構想】：${state.idea}\n【專家與使用者對答釐清】：\n${qaContext}\n請將以上資訊，轉譯並濃縮成一段「完美、結構化、可直接餵給一般 AI 模型來產出結果」的 System Prompt。\n包含：1. 指定角色 (Role) 2. 任務目標 (Task) 3. 架構與限制 (Constraints) 4. 輸出要求 (Output Format)。\n直接給出要用來複製貼上的 Prompt 內容，不要任何問候語或 Markdown 代碼塊包裝。`;

    try {
        const finalPrompt = await callGemini(prompt, false);
        
        document.getElementById('empty-state').classList.add('hidden');
        const preview = document.getElementById('preview-output');
        preview.classList.remove('hidden');
        
        // 明亮主題的 Markdown 上色
        preview.innerHTML = finalPrompt
            .replace(/^(# .*$)/gm, '<span class="text-amber-600 font-bold">$1</span>')
            .replace(/^(- .*$)/gm, '<span class="text-slate-500 font-medium">$1</span>');
        
        const now = new Date();
        const timeString = `${now.getMonth()+1}/${now.getDate()} ${now.getHours()}:${now.getMinutes().toString().padStart(2,'0')}`;
        state.promptHistory.unshift({ 
            idea: state.idea.substring(0, 20) + "...", 
            text: finalPrompt, 
            time: timeString 
        });
        if (state.promptHistory.length > 50) state.promptHistory.pop();
        localStorage.setItem('prompt_wizard_history', JSON.stringify(state.promptHistory));
        
        renderHistory();
        hideLoading();
        resetToInput(true);
    } catch (e) { hideLoading(); }
}

function resetToInput(keepIdea = false) {
    document.getElementById('state-consult').classList.add('hidden');
    document.getElementById('state-input').classList.remove('hidden');
    if(!keepIdea) document.getElementById('ideaInput').value = '';
}

function renderHistory() {
    const container = document.getElementById('history-container');
    if(state.promptHistory.length === 0) {
        container.innerHTML = '<div class="text-center py-10 text-slate-400 text-sm font-medium">尚無記憶檔案</div>';
        return;
    }
    container.innerHTML = state.promptHistory.map((item, idx) => `
        <div class="group bg-white/40 hover:bg-white/80 border border-white/60 rounded-xl p-4 cursor-pointer transition-all duration-300 relative shadow-sm hover:shadow-md" onclick="viewHistory(${idx})">
            <h3 class="text-sm font-bold text-slate-700 group-hover:text-amber-600 mb-1 transition-colors">${item.idea || '歷史詠唱紀錄'}</h3>
            <p class="text-xs text-slate-500 line-clamp-2">${item.text}</p>
            <div class="mt-3 text-right"><span class="text-[10px] font-mono text-slate-400 bg-white/50 px-2 py-1 rounded-md border border-slate-100">${item.time}</span></div>
        </div>
    `).join('');
}

function viewHistory(idx) {
    const data = state.promptHistory[idx];
    document.getElementById('empty-state').classList.add('hidden');
    const preview = document.getElementById('preview-output');
    preview.classList.remove('hidden');
    preview.innerHTML = data.text
            .replace(/^(# .*$)/gm, '<span class="text-amber-600 font-bold">$1</span>')
            .replace(/^(- .*$)/gm, '<span class="text-slate-500 font-medium">$1</span>');
}

function copyToClipboard() {
    const preview = document.getElementById('preview-output');
    if(preview.classList.contains('hidden')) return;

    navigator.clipboard.writeText(preview.innerText).then(() => {
        showToast('已複製至剪貼簿！');
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.querySelector('span').innerText = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 2500);
}
