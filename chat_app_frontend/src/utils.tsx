export const decodeToken = (accessToken: string) => {
  try {
    const payload = accessToken.split(".")[1];
    const decodedPayload = JSON.parse(atob(payload));

    return {
      username:
        decodedPayload.username.charAt(0).toUpperCase() +
        decodedPayload.username.slice(1),
      userId: decodedPayload.sub,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return { username: null, userId: null };
  }
};
