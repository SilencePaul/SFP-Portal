import { createContext } from "react";

export const AuthContext = createContext({
  currentUser:
    {
      id: "",
      name: "",
      email: "",
      role: "",
      isAuthenticated: false,
    } | null,
  login: (user: {
    id: string;
    name: string;
    email: string;
    role: string;
  }) => {},
  logout: () => {},
});
