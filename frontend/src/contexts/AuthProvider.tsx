"use client";
import { User } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    try {
      const response = await apiRequest.get("/user/info/");
      setUser(response.data.data);
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      setUser(null);
    }
  };
  useEffect(() => {
    fetchUser();
  }, []);
  useEffect(() => {
    console.log("User Changed:", user);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
