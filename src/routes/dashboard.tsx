import { auth, db } from "@/lib/firebase";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { lazy } from "react";
import { createProtectedLoader } from "../lib/protected-route";

const DashboardView = lazy(() =>
  import("../components/Dashboard").then((module) => ({
    default: module.Dashboard,
  }))
);

export const Route = createFileRoute("/dashboard")({
  component: DashboardView,
  loader: createProtectedLoader(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Unauthorized access to dashboard");
    }

    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    const userData = userDoc.data();

    if (!userData?.isProfileComplete) {
      throw redirect({
        to: "/personalization",
        replace: true,
      });
    }

    const challengesQuery = query(
      collection(db, "userChallenges"),
      where("userId", "==", currentUser.uid),
      where("status", "in", ["not-started", "in-progress"])
    );

    const challengesSnapshot = await getDocs(challengesQuery);
    const userChallenges = challengesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      user: userData,
      userChallenges,
    };
  }),
});
