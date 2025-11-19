import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "@/api/client";

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    //Load user from stored data on mount
    useEffect(() => {
        const stored = localStorage.getItem("sr_user");
        if (stored) {
            try {
                const parsedUser = JSON.parse(stored);
                setUser(parsedUser);
            } catch {
                // Ignore invalid JSON
            }
        }
    }, []);

    // Persist user to localStorage when it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem("sr_user", JSON.stringify(user));
        } else {
            localStorage.removeItem("sr_user");
        }
    }, [user]);

    const isAdmin = user?.is_admin ?? false;

    return (
        <AuthContext.Provider value={{ user, setUser, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
