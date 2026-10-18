import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function apiRequest(path, options = {}) {
  const accessToken = await AsyncStorage.getItem("access_token");

  if (!accessToken) {
    throw new Error("No Spotify access token found. Please log in.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed with status ${response.status}`,
    );
  }

  return data;
}

export function getFriends() {
  return apiRequest("/api/friends");
}

export function getFriendRequests() {
  return apiRequest("/api/friends/requests");
}

export function sendFriendRequest(receiverId) {
  return apiRequest("/api/friends/requests", {
    method: "POST",
    body: JSON.stringify({ receiverId }),
  });
}

export function respondToFriendRequest(requestId, status) {
  if (!["accepted", "rejected"].includes(status)) {
    throw new Error("Status must be accepted or rejected");
  }

  return apiRequest(`/api/friends/requests/${requestId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
