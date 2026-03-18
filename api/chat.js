export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).json({ text: "🚨 POST 요청만 가능합니다." });

  const { prompt, systemInstruction } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(200).json({ text: "🚨 Vercel 금고에 API 키가 없습니다!" });

  try {
    // 💡 선생님의 원래 코드에 있던 최신 모델명(gemini-2.5-flash)으로 원상 복구했습니다!
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt || "안녕" }] }],
        systemInstruction: { parts: [{ text: systemInstruction || "천체물리 전문가" }] }
      })
    });

    const data = await response.json();

    // 에러 발생 시 화면에 출력
    if (data.error) {
      return res.status(200).json({ text: `🚨 구글 API 거절: ${data.error.message}` });
    }

    const candidate = data.candidates?.[0];
    const textValue = candidate?.content?.parts?.[0]?.text;

    if (!textValue) return res.status(200).json({ text: "🚨 빈 답변입니다." });

    // 마크다운 기호 제거 후 전송
    const cleanText = textValue.replace(/\*\*/g, "").replace(/#/g, "").replace(/`/g, "").trim();
    return res.status(200).json({ text: cleanText });

  } catch (error) {
    return res.status(200).json({ text: `🚨 서버 충돌: ${error.message}` });
  }
}
