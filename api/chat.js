export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ text: "🚨 허용되지 않은 요청입니다." });
  }

  const { prompt, systemInstruction } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({ text: "🚨 Vercel 금고에 GEMINI_API_KEY가 없습니다!" });
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt || "안녕" }] }],
        systemInstruction: { parts: [{ text: systemInstruction || "천체물리 전문가" }] }
      })
    });

    const data = await response.json();

    // 🚨 핵심: 구글이 에러를 뱉으면, 숨기지 말고 무조건 화면에 텍스트로 띄워버립니다!
    if (data.error) {
      return res.status(200).json({ text: `🚨 구글 API 거절 원인: ${data.error.message}` });
    }

    const candidate = data.candidates?.[0];
    const textValue = candidate?.content?.parts?.[0]?.text;

    if (!textValue) {
      return res.status(200).json({ text: `🚨 빈 답변입니다. (차단 사유: ${candidate?.finishReason})` });
    }

    const cleanText = textValue.replace(/\*\*/g, "").replace(/#/g, "").replace(/`/g, "").trim();
    return res.status(200).json({ text: cleanText });

  } catch (error) {
    return res.status(200).json({ text: `🚨 서버 충돌 원인: ${error.message}` });
  }
}
