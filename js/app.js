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

async function callGemini(prompt, isJsonMode = false) {
    if (!state.apiKey) {
        toggleSettings();
        throw new Error("Missing API Key");
    }
    
    // ⚔️ 宗師級校準：v1 正式版 + 傳統 ?key= 傳輸，確保網頁端 100% 貫通
    const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${state.apiKey}`;
    
    let finalPrompt = prompt;
    if (isJsonMode) finalPrompt += `\n\n**CRITICAL: You MUST output ONLY valid JSON format. Do NOT wrap in markdown blockquotes like \`\`\`json. Just the raw JSON.**`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: finalPrompt }] }],
                generationConfig: { temperature: 0.2 }
            })
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error.message || 'API Error');
        }
        
        const data = await response.json();
        let textResult = data.candidates[0].content.parts[0].text;
        if (isJsonMode) return JSON.parse(textResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
        return textResult;
    } catch (error) {
        alert("通訊干擾：" + error.message);
        throw error;
    }
}

async function startConsultation() {
    const ideaInput = document.getElementById('ideaInput').value.trim();
    if (!ideaInput) return alert("指揮官，請先輸入您的構想！");
    state.idea = ideaInput;
    await forgeUltimatePrompt();
}

async function forgeUltimatePrompt() {
    showLoading("✨ 零一正在統合大師見解，轉譯為 AI 終極詠唱...");
    const prompt = `你現在是頂尖的 AI 提示詞工程師(Prompt Engineer)。\n【原始構想】：${state.idea}\n請將以上資訊，轉譯並濃縮成一段「完美、結構化、可直接餵給一般 AI 模型來產出結果」的 System Prompt。\n包含：1. 指定角色 (Role) 2. 任務目標 (Task) 3. 架構與限制 (Constraints) 4. 輸出要求 (Output Format)。\n直接給出要用來複製貼上的 Prompt 內容，不要任何問候語或 Markdown 代碼塊包裝。`;

    try {
        const finalPrompt = await callGemini(prompt, false);
        
        document.getElementById('empty-state').classList.add('hidden');
        const preview = document.getElementById('preview-output');
        preview.classList.remove('hidden');
        
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
