import "@testing-library/jest-dom";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { firebaseHandlers } from "./mocks/firebase";
import { quotesHandlers } from "./mocks/quotes";

// Define MSW handlers for mocking API requests
const handlers = [...firebaseHandlers, ...quotesHandlers];

// Setup MSW server
const server = setupServer(...handlers);

// Mock environment variable
vi.stubEnv("VITE_USE_FIREBASE_EMULATORS", "false");

// Mock Firebase
vi.mock("firebase/app", async () => {
  const actual = await vi.importActual("firebase/app");
  return {
    ...actual,
    initializeApp: vi.fn().mockReturnValue({
      // Mock Firebase app instance
      name: "[DEFAULT]",
      options: {},
      automaticDataCollectionEnabled: false,
    }),
  };
});

// Mock Firebase Auth
vi.mock("firebase/auth", async () => {
  const actual = await vi.importActual("firebase/auth");
  return {
    ...actual,
    getAuth: vi.fn().mockReturnValue({
      // Mock Firebase auth instance
      app: {
        name: "[DEFAULT]",
        options: {},
      },
      currentUser: null,
      tenantId: null,
      languageCode: "en",
      settings: {},
      name: "[DEFAULT]",
      config: {},
      emulator: { url: "http://localhost:9099" },
    }),
    signInWithPopup: vi.fn(),
    GoogleAuthProvider: vi.fn().mockImplementation(() => ({
      addScope: vi.fn(),
    })),
    onAuthStateChanged: vi.fn(),
    signOut: vi.fn(),
    setPersistence: vi.fn().mockResolvedValue(undefined),
    indexedDBLocalPersistence: "indexedDB",
    browserLocalPersistence: "local",
    browserSessionPersistence: "session",
    connectAuthEmulator: vi.fn(),
  };
});

// Mock Firebase Firestore
vi.mock("firebase/firestore", async () => {
  const actual = await vi.importActual("firebase/firestore");
  return {
    ...actual,
    getFirestore: vi.fn().mockReturnValue({
      type: "firestore",
      app: {
        name: "[DEFAULT]",
        options: {},
      },
      toJSON: vi.fn(),
    }),
    collection: vi.fn(),
    doc: vi.fn(),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    onSnapshot: vi.fn(),
    updateDoc: vi.fn(),
    setDoc: vi.fn(),
    deleteDoc: vi.fn(),
    serverTimestamp: vi.fn().mockReturnValue(new Date()),
    enableIndexedDbPersistence: vi.fn().mockResolvedValue(undefined),
    connectFirestoreEmulator: vi.fn(),
    initializeFirestore: vi.fn().mockReturnValue({
      type: "firestore",
      app: {
        name: "[DEFAULT]",
        options: {},
      },
      toJSON: vi.fn(),
    }),
  };
});

// Mock Firebase Functions
vi.mock("firebase/functions", async () => {
  const actual = await vi.importActual("firebase/functions");
  return {
    ...actual,
    getFunctions: vi.fn().mockReturnValue({
      app: {
        name: "[DEFAULT]",
        options: {},
      },
      customDomain: null,
      region: "us-central1",
      fetchImpl: global.fetch,
    }),
    httpsCallable: vi.fn(),
    connectFunctionsEmulator: vi.fn(),
  };
});

// Setup for each test
beforeAll(() => {
  // Start the MSW server to intercept requests
  server.listen();
});

afterEach(() => {
  // Reset any request handlers added during specific tests
  server.resetHandlers();
  // Clear all mocks
  vi.clearAllMocks();
});

afterAll(() => {
  // Stop the MSW server
  server.close();
});

// Add global timing mocks
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
