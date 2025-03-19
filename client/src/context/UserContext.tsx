import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

interface UserContextType {
  userId: string | null;
  isLoggedIn: boolean;
  login: (userId: string, username:string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const storedUserId = Cookies.get("userId");
    // if (storedUserId) {
    //   // Validate the userId with the backend
    //     fetch(`http://localhost:4000/api/user/validate`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ id: storedUserId })
    //     })
    //     .then(response => {
    //         if(response.ok) {
    //         setUserId(storedUserId);
    //         setIsLoggedIn(true);
    //         }else{
    //         Cookies.remove('userId');
    //         }
    //     })
    //     .catch(error => {
    //     console.error('Error validating userId:', error);
    //     Cookies.remove('userId');
    //   });
    // }
    if (storedUserId) {
      setUserId(storedUserId);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const login = (userId: string, username: string) => {
    setUserId(userId);
    setIsLoggedIn(true);
    Cookies.set("userId", userId);
    Cookies.set("username", username);
  };

  const logout = () => {
    setUserId(null);
    setIsLoggedIn(false);
    Cookies.remove("userId");
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        isLoggedIn,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
