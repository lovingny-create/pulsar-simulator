export default async function handler(req, res) {
  const { prompt, systemInstruction } = req.body;
  
  // 여기에 선생님의 API 키를 직접 따옴표 안에 넣으세요.
  const apiKey = "선생님의_실제_API_키_입력"; 

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    });
    // ... 이하 동일
