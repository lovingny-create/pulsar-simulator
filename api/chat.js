export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction } = req.body;
  
  // Vercel 설정에 등록한 'GEMINI_API_KEY'라는 이름의 열쇠를 가져옵니다.
  const apiKey = process.env.GEMINI_API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Vercel 설정에 GEMINI_API_KEY가 등록되지 않았습니다.' 
    });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction || "당신은 천체물리학 전문가입니다." }] }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "답변을 가져오지 못했습니다.";
    const cleanText = text.replace(/\*\*/g, "").replace(/#/g, "").replace(/`/g, "").trim();
    
    res.status(200).json({ text: cleanText });

  } catch (error) {
    res.status(500).json({ error: '서버 통신 오류: ' + error.message });
  }
}
