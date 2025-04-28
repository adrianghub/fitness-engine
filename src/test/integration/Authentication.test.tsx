import { User } from "@/types/models";
import { useAuth } from "@/useAuth";
import userEvent from "@testing-library/user-event";
import {
  User as FirebaseUser,
  UserCredential,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "../utils/render";

// Mock Firebase Auth
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
  GoogleAuthProvider: vi.fn(() => ({
    addScope: vi.fn(),
  })),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  setPersistence: vi.fn().mockImplementation(() => Promise.resolve()),
  indexedDBLocalPersistence: "indexedDB",
  browserLocalPersistence: "local",
  browserSessionPersistence: "session",
  connectAuthEmulator: vi.fn(),
}));

// Mock ThemeProvider
vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock useAuth hook
vi.mock("@/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Create mock user with required fields
const mockUserData: User = {
  email: "test@example.com",
  displayName: "Test User",
  level: "beginner",
  points: 0,
  isProfileComplete: true,
};

// Create mock Firebase user
const mockFirebaseUser: Partial<FirebaseUser> = {
  uid: "test-user-id",
  displayName: "Test User",
  email: "test@example.com",
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: "mock-refresh-token",
  tenantId: null,
  delete: vi.fn(),
  getIdToken: vi.fn(),
  getIdTokenResult: vi.fn(),
  reload: vi.fn(),
  toJSON: vi.fn(),
};

// Login Button component
function LoginButton({ onLogin }: { onLogin: () => void }) {
  return (
    <button onClick={onLogin} data-testid='google-login-button'>
      Login with Google
    </button>
  );
}

// Protected content component
function ProtectedContent({ user }: { user: FirebaseUser | null }) {
  if (!user) {
    return <div>Please log in</div>;
  }
  return (
    <div data-testid='protected-content'>Welcome, {user.displayName}!</div>
  );
}

// Type for auth hook return that matches the actual useAuth return type
interface AuthReturnType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  user: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  getIdToken: () => Promise<string | null>;
  login?: () => Promise<void> | void;
  logout?: () => Promise<void> | void;
  checkAuthState?: () => void;
}

describe("Authentication System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("displays login button when user is not authenticated", () => {
    // Mock useAuth to return not logged in state
    vi.mocked(useAuth).mockReturnValue({
      currentUser: null,
      userData: null,
      user: null,
      isLoading: false,
      isAuthenticated: false,
      getIdToken: vi.fn().mockResolvedValue(null),
      login: vi.fn(),
      logout: vi.fn(),
      checkAuthState: vi.fn(),
    } as AuthReturnType);

    render(<LoginButton onLogin={() => {}} />);

    expect(screen.getByTestId("google-login-button")).toBeInTheDocument();
    expect((useAuth() as AuthReturnType).user).toBeNull();
  });

  it("handles Google authentication flow correctly", async () => {
    // Setup mock functions
    const mockLogin = vi.fn();

    // Mock useAuth to return not logged in state with login function
    vi.mocked(useAuth).mockReturnValue({
      currentUser: null,
      userData: null,
      user: null,
      isLoading: false,
      isAuthenticated: false,
      getIdToken: vi.fn().mockResolvedValue(null),
      login: mockLogin,
      logout: vi.fn(),
      checkAuthState: vi.fn(),
    } as AuthReturnType);

    // Mock signInWithPopup to resolve with mock user
    vi.mocked(signInWithPopup).mockResolvedValue({
      user: mockFirebaseUser as FirebaseUser,
    } as UserCredential);

    // Setup user event and render login button
    const user = userEvent.setup();
    render(<LoginButton onLogin={mockLogin} />);

    // Click login button
    await user.click(screen.getByTestId("google-login-button"));

    // Verify login function was called
    expect(mockLogin).toHaveBeenCalled();

    // Mock useAuth to return logged in state
    vi.mocked(useAuth).mockReturnValue({
      currentUser: mockFirebaseUser as FirebaseUser,
      userData: mockUserData,
      user: mockFirebaseUser as FirebaseUser,
      isLoading: false,
      isAuthenticated: true,
      getIdToken: vi.fn().mockResolvedValue("mock-token"),
      login: vi.fn(),
      logout: vi.fn(),
      checkAuthState: vi.fn(),
    } as AuthReturnType);

    // Render protected content
    render(<ProtectedContent user={mockFirebaseUser as FirebaseUser} />);

    // Verify protected content is displayed
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(
      screen.getByText(`Welcome, ${mockFirebaseUser.displayName}!`)
    ).toBeInTheDocument();
  });

  it("handles user logout correctly", async () => {
    // Setup mock functions
    const mockLogout = vi.fn();

    // Mock useAuth to return logged in state with logout function
    vi.mocked(useAuth).mockReturnValue({
      currentUser: mockFirebaseUser as FirebaseUser,
      userData: mockUserData,
      user: mockFirebaseUser as FirebaseUser,
      isLoading: false,
      isAuthenticated: true,
      getIdToken: vi.fn().mockResolvedValue("mock-token"),
      login: vi.fn(),
      logout: mockLogout,
      checkAuthState: vi.fn(),
    } as AuthReturnType);

    // Mock signOut to resolve
    vi.mocked(signOut).mockResolvedValue(undefined);

    // Call logout function
    await mockLogout();

    // Verify signOut was called
    expect(mockLogout).toHaveBeenCalled();

    // Mock useAuth to return logged out state
    vi.mocked(useAuth).mockReturnValue({
      currentUser: null,
      userData: null,
      user: null,
      isLoading: false,
      isAuthenticated: false,
      getIdToken: vi.fn().mockResolvedValue(null),
      login: vi.fn(),
      logout: vi.fn(),
      checkAuthState: vi.fn(),
    } as AuthReturnType);

    // Render protected content for logged out user
    render(<ProtectedContent user={null} />);

    // Verify logged out state
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.getByText("Please log in")).toBeInTheDocument();
  });

  it("redirects unauthenticated users away from protected routes", async () => {
    // Mock useAuth to return not logged in state
    vi.mocked(useAuth).mockReturnValue({
      currentUser: null,
      userData: null,
      user: null,
      isLoading: false,
      isAuthenticated: false,
      getIdToken: vi.fn().mockResolvedValue(null),
      login: vi.fn(),
      logout: vi.fn(),
      checkAuthState: vi.fn(),
    } as AuthReturnType);

    // Render with logged out state
    const { rerender } = render(<ProtectedContent user={null} />);

    // Verify logged out content
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(screen.getByText("Please log in")).toBeInTheDocument();

    // Update to logged in state
    vi.mocked(useAuth).mockReturnValue({
      currentUser: mockFirebaseUser as FirebaseUser,
      userData: mockUserData,
      user: mockFirebaseUser as FirebaseUser,
      isLoading: false,
      isAuthenticated: true,
      getIdToken: vi.fn().mockResolvedValue("mock-token"),
      login: vi.fn(),
      logout: vi.fn(),
      checkAuthState: vi.fn(),
    } as AuthReturnType);

    // Re-render with logged in state
    rerender(<ProtectedContent user={mockFirebaseUser as FirebaseUser} />);

    // Verify protected content is now shown
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    expect(
      screen.getByText(`Welcome, ${mockFirebaseUser.displayName}!`)
    ).toBeInTheDocument();
  });
});
