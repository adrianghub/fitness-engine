import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { ADMIN_USER, TEST_USER, TEST_USER_2 } from "../data/constants";

// Create a test user
export async function createTestUser(): Promise<string> {
  console.log("Creating test user...");

  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      TEST_USER.email,
      TEST_USER.password
    );

    const userId = userCredential.user.uid;
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      email: TEST_USER.email,
      displayName: "Test User",
      level: TEST_USER.level,
      fitnessGoals: ["lose weight", "improve endurance"],
      trainingFrequency: "3",
      totalPoints: 10,
      role: TEST_USER.role,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log("Test user created with ID:", userId);
    return userId;
  } catch (error) {
    console.error("Error creating test user:", error);
    throw error;
  }
}

// Create a second test user
export async function createTestUser2(): Promise<string> {
  console.log("Creating test user 2...");

  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      TEST_USER_2.email,
      TEST_USER_2.password
    );

    const userId = userCredential.user.uid;
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      email: TEST_USER_2.email,
      displayName: "Intermediate User",
      level: TEST_USER_2.level,
      fitnessGoals: ["gain muscle", "improve strength"],
      trainingFrequency: "4",
      totalPoints: 75,
      role: TEST_USER_2.role,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log("Test user 2 created with ID:", userId);
    return userId;
  } catch (error) {
    console.error("Error creating test user 2:", error);
    throw error;
  }
}

// Create an admin user
export async function createAdminUser(): Promise<string> {
  console.log("Creating admin user...");

  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_USER.email,
      ADMIN_USER.password
    );

    const userId = userCredential.user.uid;

    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      email: ADMIN_USER.email,
      displayName: "Admin User",
      level: ADMIN_USER.level,
      fitnessGoals: ["maintain fitness", "improve strength"],
      trainingFrequency: "5",
      totalPoints: 250,
      role: ADMIN_USER.role,
      isAdmin: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log("Admin user created with ID:", userId);
    return userId;
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
}

// Sign in as a user
export async function signInAsUser(
  email: string,
  password: string
): Promise<string> {
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log(`Signed in as ${email}`);
    return userCredential.user.uid;
  } catch (error) {
    console.error(`Error signing in as ${email}:`, error);
    throw error;
  }
}
