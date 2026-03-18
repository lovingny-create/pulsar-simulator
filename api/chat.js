export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, systemInstruction } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'API 키가 없습니다.' });

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction || "천체물리 전문가" }] }
      })
    });

    const data = await response.json();

    // 1. 구글 API 자체 에러 확인
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // 2. 답변 내용이 있는지 안전하게 확인 (이 부분이 500 에러의 주범일 확률이 높음)
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      // 답변이 차단되었거나 비어있을 경우의 처리
      const reason = candidate?.finishReason || "Unknown reason";
      return res.status(200).json({ text: `AI가 답변을 생성할 수 없습니다. (사유: ${reason})` });
    }

    // 3. 깨끗하게 텍스트 정제 후 전송
    const cleanText = text.replace(/\*\*/g, "").replace(/#/g, "").replace(/`/g, "").trim();
    return res.status(200).json({ text: cleanText });

  } catch (error) {
    return res.status(500).json({ error: '서버 내부 오류: ' + error.message });
  }
}
