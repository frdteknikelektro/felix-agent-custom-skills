/**
 * ClickUp API client - core HTTP layer
 */

export const API_BASE = 'https://api.clickup.com/api/v2';
export const API_BASE_V3 = 'https://api.clickup.com/api/v3';

// Make API request
export async function apiRequest(endpoint, options = {}) {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) {
    console.error('Error: CLICKUP_API_TOKEN not set');
    console.error('');
    console.error('Run:');
    console.error('  export CLICKUP_API_TOKEN="pk_your_token_here"');
    console.error('');
    console.error('Get token at: ClickUp Settings > Apps > API Token');
    process.exit(1);
  }

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ClickUp API error: ${response.status} - ${text}`);
  }

  // Handle empty responses (e.g., DELETE returns empty body)
  const text = await response.text();
  if (!text) {
    return {};
  }
  return JSON.parse(text);
}

// Make API v3 request (used for Docs API)
export async function apiRequestV3(endpoint, options = {}) {
  const token = process.env.CLICKUP_API_TOKEN;
  if (!token) {
    console.error('Error: CLICKUP_API_TOKEN not set');
    console.error('');
    console.error('Run:');
    console.error('  export CLICKUP_API_TOKEN="pk_your_token_here"');
    console.error('');
    console.error('Get token at: ClickUp Settings > Apps > API Token');
    process.exit(1);
  }

  const url = `${API_BASE_V3}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ClickUp API error: ${response.status} - ${text}`);
  }

  const text = await response.text();
  if (!text) {
    return {};
  }
  return JSON.parse(text);
}
