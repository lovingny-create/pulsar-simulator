export default async function handler(req, res) {
  // 1. 보안을 위해 POST 요청만 허용합니다.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. index.html에서 보낸 데이터를 받습니다.
  const { prompt, systemInstruction } = req.body;
  
  // 3. 보안 핵심: 깃허브에 키를 직접 적지 않고, Vercel 금고(환경변수)에서 가져옵니다.
  // Vercel 설정에 GEMINI_API_KEY라는 이름으로 키를 등록하셨다면 이 이름표가 작동합니다.
  const apiKey = process.env.GEMINI_API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Vercel 설정에 GEMINI_API_KEY가 등록되지 않았습니다.' 
    });
  }

  try {
    // 4. Google Gemini API 호출
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction || "당신은 천체물리학 전문가입니다." }] }
      })
    });

    const data = await response.json();
    
    // API 응답 에러 처리
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // 5. 답변 텍스트 추출 및 정제 (마크다운 기호 제거)
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "답변을 가져오지 못했습니다.";
    const cleanText = text.replace(/\*\*/g, "").replace(/#/g, "").replace(/`/g, "").trim();
    
    res.status(200).json({ text: cleanText });

  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({ error: '서버 통신 중 오류 발생: ' + error.message });
  }
}