"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  profile_id: number;
  full_name: string;
  avatar: string | null;
  gender: string | null;
}

export interface UserInfo {
  user_id: number;
  email: string;
  is_admin: boolean;
  profile: UserProfile;
}

interface UserContextType {
  email: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  userInfo: UserInfo | null;
  setEmail: (email: string | null) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setUserInfo: (user: UserInfo | null) => void;
  signOut: () => void; 
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [email, setEmailState] = useState<string | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [refreshToken, setRefreshTokenState] = useState<string | null>(null);
  const [userInfo, setUserInfoState] = useState<UserInfo | null>(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const storedUserInfo = localStorage.getItem("userInfo");

    if (storedEmail) setEmailState(storedEmail);
    if (storedAccessToken) setAccessTokenState(storedAccessToken);
    if (storedRefreshToken) setRefreshTokenState(storedRefreshToken);
    if (storedUserInfo) setUserInfoState(JSON.parse(storedUserInfo));
  }, []);

  // Setters đồng bộ với localStorage
  const setEmail = (value: string | null) => {
    setEmailState(value);
    if (value) localStorage.setItem("email", value);
    else localStorage.removeItem("email");
  };

  const setAccessToken = (value: string | null) => {
    setAccessTokenState(value);
    if (value) localStorage.setItem("accessToken", value);
    else localStorage.removeItem("accessToken");
  };

  const setRefreshToken = (value: string | null) => {
    setRefreshTokenState(value);
    if (value) localStorage.setItem("refreshToken", value);
    else localStorage.removeItem("refreshToken");
  };

  const setUserInfo = (value: UserInfo | null) => {
    setUserInfoState(value);
    if (value) localStorage.setItem("userInfo", JSON.stringify(value));
    else localStorage.removeItem("userInfo");
  };

  const signOut = () => {
    setEmailState(null);
    setAccessTokenState(null);
    setRefreshTokenState(null);
    setUserInfoState(null);

    localStorage.removeItem("email");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");

    // Optional: Redirect về trang login
    // window.location.href = "/login";
  };

  return (
    <UserContext.Provider
      value={{
        email,
        accessToken,
        refreshToken,
        userInfo,
        setEmail,
        setAccessToken,
        setRefreshToken,
        setUserInfo,
        signOut, 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside <UserProvider>");
  }
  return context;
};