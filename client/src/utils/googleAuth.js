import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

/**
 * Reusable Google authentication handler.
 * Works for both Login and Register — Firebase handles both cases:
 *   - New user  → account is auto-created
 *   - Existing  → user is signed in silently
 *
 * @param {object} options
 * @param {Function} options.dispatch       - Redux dispatch
 * @param {Function} options.setUser        - Redux action to store user
 * @param {Function} options.navigate       - react-router navigate
 * @param {Function} options.setLoading     - setState to show/hide loading
 * @param {string}  [options.redirectPath]  - where to go on success (default "/dashboard")
 */
export async function handleGoogleAuth({
  dispatch,
  setUser,
  navigate,
  setLoading,
  redirectPath = "/dashboard",
  toast,
}) {
  setLoading(true);

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Store minimal user info in Redux
    dispatch(
      setUser({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      })
    );

    toast.success("Google sign-in successful! Welcome, " + (user.displayName || user.email));
    navigate(redirectPath);
  } catch (error) {
    // auth/popup-closed-by-user is not a real error — user just closed the popup
    if (error.code !== "auth/popup-closed-by-user") {
      console.error("Google auth error:", error);
      toast.error(error.message || "Google sign-in failed. Please try again.");
    }
  } finally {
    setLoading(false);
  }
}
