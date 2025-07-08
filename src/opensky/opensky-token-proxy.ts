import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
console.log("Client ID:", process.env.VITE_REACT_OSKY_CLIENT_ID);
console.log("Client Secret:", process.env.VITE_REACT_OSKY_CLIENT_SECRET ? "****" : "NOT SET");

const app = express();
const PORT = 3001;

// Token endpoint to proxy OpenSky Network authentication
const TOKEN_URL =
  "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";

app.get("/oskytokenapi", async (_req, res) => {
  const clientId = process.env.VITE_REACT_OSKY_CLIENT_ID;
  const clientSecret = process.env.VITE_REACT_OSKY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(500).json({ error: "Client ID/Secret is missing!" });
    console.error("Client ID or Client Secret is not set in environment variables.");
    return;
  }

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);

  try {
    const tokenResp = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    if (!tokenResp.ok) {
      const errorText = await tokenResp.text();
      res.status(tokenResp.status).send(errorText);
      return;
    }

    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    const data = await tokenResp.json() as {
      access_token: string;
      expires_in: number;
      token_type: string;
      [key: string]: unknown;
    };
    res.status(200).json({
      access_token: data.access_token,
      expires_in: data.expires_in,
      token_type: data.token_type
    });

  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(PORT, () =>
  console.log(`[opensky-token-proxy] runs @ http://localhost:${PORT}/oskytokenapi`)
);