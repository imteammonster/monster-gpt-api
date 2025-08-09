// /api/monster-gate.js — 複数サービス対応版（Vercel Serverless Function）
export default async function handler(req, res) {
  try {
    const { email = "", token = "", service = "" } = req.query;

    // 1) 入力チェック
    if (!email || !token || !service) {
      return res.status(200).json({ allowed: false, status: "bad_request" });
    }

    // 2) サービス名→環境変数の接頭辞に正規化（例：fxpro → FXPRO）
    const key = String(service).toUpperCase().replace(/[^A-Z0-9]/g, "");

    // 3) 期待トークン & GAS URL を環境変数から取得
    const EXPECTED_TOKEN = process.env[`SERVICE_${key}_TOKEN`];
    const GAS_URL = process.env[`SERVICE_${key}_GAS_URL`];

    if (!EXPECTED_TOKEN || !GAS_URL) {
      // 未設定のサービス名
      return res.status(200).json({ allowed: false, status: "unauthorized" });
    }

    // 4) トークン検証（fail-closed）
    if (token !== EXPECTED_TOKEN) {
      return res.status(200).json({ allowed: false, status: "unauthorized" });
    }

    // 5) GASへ中継
    const url = `${GAS_URL}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
    const r = await fetch(url, { redirect: "follow" });
    const text = await r.text();

    // 6) JSONだけ返す（保険）
    try {
      const json = JSON.parse(text);
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json(json);
    } catch {
      return res.status(200).json({ allowed: false, status: "unauthorized" });
    }
  } catch {
    return res.status(200).json({ allowed: false, status: "unauthorized" });
  }
}



// // /api/monster-gate.js — Vercelのサーバーレス関数
// export default async function handler(req, res) {
//   try {
//     const { email = "", token = "" } = req.query;

//     // 入力チェック（fail-closed）
//     if (!email || !token) {
//       return res.status(200).json({ allowed: false, status: "bad_request" });
//     }
//     if (token !== "Monster_GPTs_API_FXPro") {
//       return res.status(200).json({ allowed: false, status: "unauthorized" });
//     }

//     // あなたのGAS URL（?は付けない）
//     const GAS_URL = "https://script.google.com/macros/s/AKfycbzbiM2cpgtY4f7qX27j51BZ1r8iUONWU4-8DFlv2U5yKIxDIcccKTh14ibIcb16L1U2lw/exec";

//     // GASへ中継
//     const url = `${GAS_URL}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
//     const r = await fetch(url, { redirect: "follow" });

//     const text = await r.text();
//     let json;
//     try { json = JSON.parse(text); }
//     catch { return res.status(200).json({ allowed: false, status: "unauthorized" }); }

//     res.setHeader("Cache-Control", "no-store");
//     return res.status(200).json(json);

//   } catch (e) {
//     return res.status(200).json({ allowed: false, status: "unauthorized" });
//   }
// }
