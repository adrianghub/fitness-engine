import { auth, db } from "@/lib/firebase";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { doc, getDoc } from "firebase/firestore";
import { lazy } from "react";
import { createProtectedLoader } from "../lib/protected-route";

const DashboardView = lazy(() =>
  import("../modules/challenges/components/Dashboard").then((module) => ({
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

    return {};
  }),
});
