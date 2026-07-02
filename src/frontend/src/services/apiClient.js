const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "/api"
).replace(/\/$/, "");

export function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function requestJson(path, options = {}) {
  const response = await fetch(buildApiUrl(path), options);
  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `API request failed with status ${response.status}: ${responseText}`
    );
  }

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error("API response was not valid JSON.");
  }
}