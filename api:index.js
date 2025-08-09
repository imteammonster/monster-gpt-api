// Expressを使ったAPIサーバー
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 動作確認用
app.get("/", (req, res) => {
  res.json({ message: "Monster GPT API is running" });
});

// GASや外部サービスから叩くエンドポイント
app.post("/gpt", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "No prompt provided" });

    // OpenAI API呼び出し（ダミー）
    const result = `あなたが送ったプロンプトは: ${prompt}`;
    res.json({ reply: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vercelは環境変数 PORT を自動で設定
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
