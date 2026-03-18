export default async function handler(req, res) {
  // 1. 보안을 위해 POST 방식의 요청만 허용합니다.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction } = req.body;
  
  // 2. Vercel 서버 설정(Environment Variables)에 저장할 비밀 키를 불러옵니다.
  const apiKey = process.env.GEMINI_API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ error: '서버에 API 키가 설정되지 않았습니다. Vercel 설정을 확인하세요.' });
  }

  try {
    // 3. 구글 Gemini API에 선생님 대신 질문을 던집니다.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // 4. 답변 텍스트만 추출하여 깨끗하게 다듬습니다.
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "답변을 가져오지 못했습니다.";
    const cleanText = text.replace(/\*\*/g, "").replace(/#/g, "").replace(/`/g, "").trim();
    
    // 5. 최종 답변만 학생(브라우저)에게 보내줍니다.
    res.status(200).json({ text: cleanText });

  } catch (error) {
    res.status(500).json({ error: '서버 통신 중 오류가 발생했습니다.' });
  }
}