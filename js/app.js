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
    
    showLoading("零一與宗師聯合會診中，拆解您的構想邊界...");
    
    const prompt = `使用者想開發的專案構想：「${idea}」。\n請模擬包含「🤖 零一 (副指揮官)」、「🧠 Claude 3.5 Sonnet」、「🍎 史蒂夫·賈伯斯」等頂尖智囊團，針對此專案提出【3 到 4 個最致命、最能釐清開發規格】的核心提問。\n【角色規範】：零一必須以「【零一 (副指揮官)】：報告指揮官！」開頭，展現邏輯統籌視角。其他大師依其特長發問。\n格式必須是 JSON 陣列字串。\n範例：["【零一 (副指揮官)】：報告指揮官！資料流存在盲區，請問系統需要具備外部 API 獲取資料能力嗎？"]`;

    try {
        state.questions = await callGemini(prompt, true);
        
        // 切換 UI 面板
        document.getElementById('state-input').classList.add('hidden');
        document.getElementById('state-consult').classList.remove('hidden');
        
        const qContainer = document.getElementById('questionsContainer');
        qContainer.innerHTML = '';
        state.questions.forEach((q, index) => {
            qContainer.innerHTML += `
                <div class="bg-white/5 p-5 rounded-2xl border border-white/10 border-l-4 border-l-blue-500 shadow-sm">
                    <label class="block font-medium text-zinc-200 mb-3 text-sm leading-relaxed">
                        <span class="text-blue-400 font-bold mr-2">Q${index + 1}.</span>${q}
                    </label>
                    <textarea id="answer-${index}" rows="2" class="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition" placeholder="請指揮官輸入決策 (或留空交由系統預設)..."></textarea>
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
    showLoading("零一正在統合大師見解，轉譯為 AI 終極詠唱...");

    const prompt = `你現在是頂尖的 AI 提示詞工程師(Prompt Engineer)。\n【原始構想】：${state.idea}\n【專家與使用者對答釐清】：\n${qaContext}\n請將以上資訊，轉譯並濃縮成一段「完美、結構化、可直接餵給一般 AI 模型來產出結果」的 System Prompt。\n包含：1. 指定角色 (Role) 2. 任務目標 (Task) 3. 架構與限制 (Constraints) 4. 輸出要求 (Output Format)。\n直接給出要用來複製貼上的 Prompt 內容，不要任何問候語或 Markdown 代碼塊包裝。`;

    try {
        const finalPrompt = await callGemini(prompt, false);
        
        // 渲染至右側面板
        document.getElementById('empty-state').classList.add('hidden');
        const preview = document.getElementById('preview-output');
        preview.classList.remove('hidden');
        
        // 簡單 Markdown 上色
        preview.innerHTML = finalPrompt
            .replace(/^(# .*$)/gm, '<span class="text-blue-400 font-bold">$1</span>')
            .replace(/^(- .*$)/gm, '<span class="text-zinc-400">$1</span>');
        
        // 儲存至歷史紀錄
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
        resetToInput(true); // 回到輸入狀態，保留右側結果
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
        container.innerHTML = '<div class="text-center py-10 text-zinc-600 text-sm">尚無記憶檔案</div>';
        return;
    }
    container.innerHTML = state.promptHistory.map((item, idx) => `
        <div class="group bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-4 cursor-pointer transition relative" onclick="viewHistory(${idx})">
            <h3 class="text-sm font-semibold text-zinc-300 group-hover:text-blue-400 mb-1">${item.idea}</h3>
            <p class="text-xs text-zinc-500 line-clamp-2">${item.text}</p>
            <div class="mt-2 text-right"><span class="text-[10px] text-zinc-600">${item.time}</span></div>
        </div>
    `).join('');
}

function viewHistory(idx) {
    const data = state.promptHistory[idx];
    document.getElementById('empty-state').classList.add('hidden');
    const preview = document.getElementById('preview-output');
    preview.classList.remove('hidden');
    preview.innerHTML = data.text
            .replace(/^(# .*$)/gm, '<span class="text-blue-400 font-bold">$1</span>')
            .replace(/^(- .*$)/gm, '<span class="text-zinc-400">$1</span>');
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
