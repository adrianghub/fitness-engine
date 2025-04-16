import type { User } from "@/types/models";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import {
  doc,
  setDoc,
  Timestamp,
  type DocumentReference,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { BEGINNER_USER, INTERMEDIATE_USER, UBER_DUPER_USER } from "./constants";

export async function createBeginnerUser(): Promise<string> {
  console.log("Creating beginner user...");

  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      BEGINNER_USER.email,
      BEGINNER_USER.password
    );

    const userId = userCredential.user.uid;
    const userRef = doc(db, "users", userId) as DocumentReference<User>;
    await setDoc(userRef, {
      email: BEGINNER_USER.email,
      displayName: "Beginner User",
      level: BEGINNER_USER.level,
      fitnessGoals: ["lose weight", "improve endurance"],
      points: 10,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isProfileComplete: false,
    });

    console.log("Test user created with ID:", userId);
    return userId;
  } catch (error) {
    console.error("Error creating test user:", error);
    throw error;
  }
}

export async function createIntermediateUser(): Promise<string> {
  console.log("Creating intermediate user...");

  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      INTERMEDIATE_USER.email,
      INTERMEDIATE_USER.password
    );

    const userId = userCredential.user.uid;
    const userRef = doc(db, "users", userId) as DocumentReference<User>;
    await setDoc(userRef, {
      email: INTERMEDIATE_USER.email,
      displayName: "Intermediate User",
      level: INTERMEDIATE_USER.level,
      fitnessGoals: ["gain muscle", "improve strength"],
      points: 75,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isProfileComplete: false,
    });

    console.log("Intermediate user created with ID:", userId);
    return userId;
  } catch (error) {
    console.error("Error creating intermediate user:", error);
    throw error;
  }
}

export async function createUberDuperUser(): Promise<string> {
  console.log("Creating uber-duper user...");

  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      UBER_DUPER_USER.email,
      UBER_DUPER_USER.password
    );

    const userId = userCredential.user.uid;

    const userRef = doc(db, "users", userId) as DocumentReference<User>;
    await setDoc(userRef, {
      email: UBER_DUPER_USER.email,
      displayName: "Uber-Duper User",
      level: UBER_DUPER_USER.level,
      fitnessGoals: ["maintain fitness", "improve strength"],
      points: 250,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isProfileComplete: false,
    });

    console.log("Uber-duper user created with ID:", userId);
    return userId;
  } catch (error) {
    console.error("Error creating uber-duper user:", error);
    throw error;
  }
}
