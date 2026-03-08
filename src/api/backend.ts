const API = "https://5d3rdwuh9c.execute-api.us-east-1.amazonaws.com";

export async function createSession() {
  const res = await fetch(`${API}/session`, {
    method: "POST"
  });

  const data = await res.json();
  return data.sessionId;
}

export async function sendChat(
  sessionId: string,
  message: string,
  imageBase64?: string
) {

  const body: any = {
    sessionId,
    message
  };

  if (imageBase64) {
    body.imageBase64 = imageBase64;
  }

  const res = await fetch(`${API}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  return data.aiText;
}