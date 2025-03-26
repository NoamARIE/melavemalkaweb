import './App.css';
import Pages from "@/pages/index.jsx"; // מוודא שהנתיב נכון
import { Toaster } from "@/components/ui/toaster";
import Login from "@/pages/Login.jsx"; // מייבא את רכיב ההתחברות

function App() {
  return (
    <>
      <Login /> {/* כפתור ההתחברות יוצג בכל עמוד */}
      <Pages />
      <Toaster />
    </>
  );
}

export default App;
