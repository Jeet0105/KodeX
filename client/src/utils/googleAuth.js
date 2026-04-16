import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import api from "./api";

export async function handleGoogleAuth({
  dispatch,
  setUser,
  navigate,
  setLoading,
  toast,
}) {
  setLoading(true);

  try {
    // Step 1: Get user info from Firebase
    const result = await signInWithPopup(auth, provider);
    const { displayName, email, photoURL } = result.user;

    // Step 2: Send to YOUR backend — sets JWT cookie + upserts DB record
    const res = await api.post("/api/v1/auth/google", {
      username: displayName,
      email,
      profilePictureUrl: photoURL,
    });

    // Step 3: Store YOUR backend's user shape in Redux (not Firebase's)
    dispatch(setUser(res.data.user));

    toast.success(res.data.message || "Google sign-in successful!");
    
    if (res.data.user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/problems");
    }
  } catch (error) {
    if (error.code !== "auth/popup-closed-by-user") {
      console.error("Google auth error:", error);
      const message =
        error.response?.data?.message || // backend error
        error.message ||                 // firebase error
        "Google sign-in failed.";
      toast.error(message);
    }
  } finally {
    setLoading(false);
  }
}