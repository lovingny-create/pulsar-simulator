export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction } = req.body;
  const apiKey = process.env.GEMINI_API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ error: 'Vercel 설정에 GEMINI_API_KEY가 없습니다.' });
  }

  try {
    // 모델명을 가장 안정적인 gemini-1.5-flash로 변경 (선택 사항이나 권장)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction || "천체물리 전문가" }] }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "답변 실패";
    const cleanText = text.replace(/\*\*/g, "").replace(/#/g, "").replace(/`/g, "").trim();
    
    return res.status(200).json({ text: cleanText });
  } catch (error) {
    return res.status(500).json({ error: '통신 오류: ' + error.message });
  }
}
