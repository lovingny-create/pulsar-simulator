export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).json({ text: "🚨 POST 요청만 가능합니다." });

  const { prompt, systemInstruction } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(200).json({ text: "🚨 Vercel 금고에 API 키가 없습니다!" });

  try {
    // 💡 여기가 핵심입니다! 모델 이름을 구글이 100% 인식하는 'gemini-1.5-flash-latest'로 바꿨습니다.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt || "안녕" }] }],
        systemInstruction: { parts: [{ text: systemInstruction || "천체물리 전문가" }] }
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ text: `🚨 구글 API 거절: ${data.error.message}` });
    }

    const candidate = data.candidates?.[0];
    const textValue = candidate?.content?.parts?.[0]?.text;

    if (!textValue) return res.status(200).json({ text: "🚨 빈 답변입니다." });

    const cleanText = textValue.replace(/\*\*/g, "").replace(/#/g, "").replace(/`/g, "").trim();
    return res.status(200).json({ text: cleanText });

  } catch (error) {
    return res.status(200).json({ text: `🚨 서버 충돌: ${error.message}` });
  }
}
