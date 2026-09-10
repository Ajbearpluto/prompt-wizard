async function callGemini(prompt, isJsonMode = false) {
    if (!state.apiKey) {
        toggleSettings();
        throw new Error("Missing API Key");
    }
    
    // ⚔️ 宗師級校準：捨棄 v1beta，切換至 v1 穩定正式版 API，並鎖定 1.5-flash
    const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${state.apiKey}`;
    
    let finalPrompt = prompt;
    if (isJsonMode) finalPrompt += `\n\n**CRITICAL: You MUST output ONLY valid JSON format. Do NOT wrap in markdown blockquotes like \`\`\`json. Just the raw JSON.**`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // v1 正式版的結構要求更嚴謹，此處已完美對接
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
        // 增強錯誤回報，幫助釐清金鑰來源
        alert("通訊干擾：" + error.message + "\n\n💡 宗師提示：若持續失敗，請確認此金鑰是從 Google AI Studio (aistudio.google.com) 重新申請的最新金鑰。");
        throw error;
    }
}
