async function callGemini(prompt, isJsonMode = false) {
    if (!state.apiKey) {
        toggleSettings();
        throw new Error("Missing API Key");
    }
    
    // ⚔️ 數位宗師終極校準：強制切換為「v1 正式版」端點！(不再是 v1beta)
    // 並且使用傳統 ?key= 確保新版 AQ 金鑰不會被瀏覽器安全機制阻擋
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
