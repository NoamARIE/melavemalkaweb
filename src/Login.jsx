import { auth, provider } from "./firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { useState, useEffect } from "react";

function Login() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("שגיאה בהתחברות:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div>
      {user ? (
        <>
          <p>שלום, {user.displayName}</p>
          <img src={user.photoURL} alt="User Profile" width="50" />
          <button onClick={logout}>🔴 התנתק</button>
        </>
      ) : (
        <button onClick={loginWithGoogle}>🔵 התחבר עם גוגל</button>
      )}
    </div>
  );
}

export default Login;
