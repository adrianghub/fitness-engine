import { logger } from "@/lib/logger";
import { User } from "@/types/models";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "./lib/firebase";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const ensureUserDataExists = async (user: FirebaseUser) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const existingData = userSnap.data() as Omit<User, "uid">;
        const updatedUserData = {
          ...existingData,
          uid: user.uid,
          lastLoginAt: new Date(),
        } as User;

        await setDoc(
          userRef,
          {
            lastLoginAt: new Date(),
          },
          { merge: true }
        );

        setUserData(updatedUserData);
        return updatedUserData;
      } else {
        const newUserData: User = {
          email: user.email || "",
          displayName: user.displayName || undefined,
          level: "beginner",
          points: 0,
          isProfileComplete: false,
        };

        await setDoc(userRef, newUserData);

        const verifySnap = await getDoc(userRef);
        if (verifySnap.exists()) {
          setUserData(newUserData);
          return newUserData;
        } else {
          logger.error("Auth", "Failed to create user document!");
          return null;
        }
      }
    } catch (error) {
      logger.error("Auth", "Error ensuring user data exists:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        await ensureUserDataExists(user);
      } else {
        setUserData(null);
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const getIdToken = async (): Promise<string | null> => {
    if (!currentUser) return null;
    try {
      return await currentUser.getIdToken();
    } catch (error) {
      logger.error("Auth", "Error getting ID token:", error);
      return null;
    }
  };

  return {
    currentUser,
    userData,
    isLoading,
    isAuthenticated: !!currentUser,
    getIdToken,
  };
}
