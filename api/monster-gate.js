// /api/monster-gate.js — 共通GASへのシンプル中継（検証はGAS側で実施）
export default async function handler(req, res) {
  try {
    const { email = "", token = "" } = req.query;
    if (!email || !token) {
      return res.status(200).json({ allowed:false, status:"bad_request" });
    }

    const GAS_URL = process.env.GAS_URL; // ← Vercel環境変数
    if (!GAS_URL) {
      return res.status(200).json({ allowed:false, status:"server_misconfig" });
    }

    const url = `${GAS_URL}?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
    const r = await fetch(url, { redirect: "follow" });
    const text = await r.text();

    try {
      const json = JSON.parse(text);
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json(json);
    } catch {
      return res.status(200).json({ allowed:false, status:"invalid_json" });
    }
  } catch {
    return res.status(200).json({ allowed:false, status:"error" });
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
