export class HttpApiError extends Error {
  code: number = 0;
  info: string | null;

  constructor(message: string, code?: number, info?: string) {
    super(message);
    this.code = code ?? 0;
    this.info = info ?? null;
  }
}

// const BASE_URL = "http://127.0.0.1:3000";

const BASE_URL = "http://34.159.214.145:3000";

const fetchApi = async (
  endpoint: string,
  options: RequestInit = {},
  token?: string
) => {
  try {
    const headers: Record<string, string> = {
      "content-type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["authorization"] = token;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorInfo = await response.json().catch(() => null); // Handle empty responses gracefully
      throw new HttpApiError(
        `HTTP Error: ${response.status}`,
        response.status,
        errorInfo
      );
    }

    return response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const fetchWithAuth = (
  endpoint: string,
  token: string,
  options?: RequestInit
) => fetchApi(endpoint, options, token);

const fetchWithoutAuth = (endpoint: string, options?: RequestInit) =>
  fetchApi(endpoint, options);

export const signUp = async (signUpData: any) =>
  fetchWithoutAuth("/signup", {
    method: "POST",
    body: JSON.stringify(signUpData),
  });

export const login = async (loginData: { email: string; password: string }) => {
  const data = await fetchWithoutAuth("/login", {
    method: "POST",
    body: JSON.stringify(loginData),
  });
  return { token: data.accessToken };
};

export const getUsers = (token: string) =>
  fetchWithAuth("/new-conversation", token);

export const getConversations = (token: string) =>
  fetchWithAuth("/conversation", token);

export const getConversation = (conversationId: string, token: string) =>
  fetchWithAuth(`/conversation/${conversationId}`, token);

export const createNewConversation = (userId2: string, token: string) =>
  fetchWithAuth("/new-conversation/1", token, {
    method: "POST",
    body: JSON.stringify({ userId2 }),
  });

export const getMessage = (
  conversationId: string,
  messageId: string,
  token: string
) =>
  fetchWithAuth(`/conversation/${conversationId}/message/${messageId}`, token);

export const sendMessage = (
  message: string,
  conversationId: string,
  token: string
) =>
  fetchWithAuth(`/conversation/${conversationId}/message`, token, {
    method: "POST",
    body: JSON.stringify({
      message,
    }),
  });

export const deleteMessage = (
  conversationId: string,
  messageId: string,
  token: string
) =>
  fetchWithAuth(`/conversation/${conversationId}/message/${messageId}`, token, {
    method: "DELETE",
  });

export const editMessage = (
  conversationId: string,
  messageId: string,
  editedMessage: string,
  token: string
) =>
  fetchWithAuth(`/conversation/${conversationId}/message/${messageId}`, token, {
    method: "PUT",
    body: JSON.stringify({ message: editedMessage }),
  });

export const createDemoConversation = async () => {
  try {
    const data = await fetchWithoutAuth("/demo-conversation", {
      method: "POST",
    });

    return {
      token: data.accessToken,
      username: data.username,
      email: data.email,
      password: data.password,
      userId: data.userId,
    };
  } catch (error) {
    console.error("Failed to log in as guest.", error);
    throw error;
  }
};
