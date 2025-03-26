import { auth, provider } from "@/firebase"; // ודא שהנתיב נכון
import { signInWithPopup, signOut } from "firebase/auth";
import { useState, useEffect } from "react";

function Login() {
  const [user, setUser] = useState(null);

  // מעקב אחר מצב ההתחברות של המשתמש
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe(); // ניקוי האזנה למנוע דליפות זיכרון
  }, []);

  // התחברות עם Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("שגיאה בהתחברות:", error);
    }
  };

  // התנתקות
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div style={{ textAlign: "center", margin: "20px" }}>
      {user ? (
        <>
          <p>שלום, {user.displayName}</p>
          <img src={user.photoURL} alt="User Profile" width="50" style={{ borderRadius: "50%" }} />
          <br />
          <button onClick={logout} style={{ backgroundColor: "red", color: "white", padding: "10px", borderRadius: "5px", marginTop: "10px" }}>
            🔴 התנתק
          </button>
        </>
      ) : (
        <button onClick={loginWithGoogle} style={{ backgroundColor: "blue", color: "white", padding: "10px", borderRadius: "5px" }}>
          🔵 התחבר עם גוגל
        </button>
      )}
    </div>
  );
}

export default Login;
