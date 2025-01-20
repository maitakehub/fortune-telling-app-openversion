const API_URL = import.meta.env.VITE_API_URL || `http://localhost:${import.meta.env.EXPRESS_PORT || '3000'}`;

export async function subscribeToPlan(token: string, plan: string) {
  const response = await fetch(`${API_URL}/api/subscription/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ plan }),
  });
  if (!response.ok) {
    throw new Error('Subscription failed');
  }
  const data = await response.json();
  return data;
}

export async function getSubscriptionStatus(token: string) {
  const response = await fetch(`${API_URL}/api/subscription/status`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch subscription status');
  }
  const data = await response.json();
  return data;
}
