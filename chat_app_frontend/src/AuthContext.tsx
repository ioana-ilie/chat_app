import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, createContext, ReactNode } from "react";
import { login } from "./api";
import { decodeToken } from "./utils";

interface AuthContextType {
  token: string | null;
  username: string | null;
  userId: string | null;
  login: (loginData: { email: string; password: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: authData } = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const auth = localStorage.getItem("auth") || "{}";
      return JSON.parse(auth);
    },
    staleTime: 60 * (60 * 1000),
  });

  const { mutateAsync: loginMutation } = useMutation({
    mutationFn: login,
    onSuccess: (newAuthData) => {
      localStorage.setItem("auth", JSON.stringify(newAuthData));
      queryClient.setQueryData(["auth"], newAuthData);
    },
  });

  const { mutate: logoutMutation } = useMutation({
    mutationFn: async () => {
      localStorage.removeItem("auth");
      return null;
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth"], null);
    },
  });

  const decodedAuth = authData?.token ? decodeToken(authData.token) : null;

  return (
    <AuthContext.Provider
      value={{
        token: authData?.token || null,
        username: decodedAuth?.username || null,
        userId: decodedAuth?.userId || null,
        login: loginMutation,
        logout: logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
