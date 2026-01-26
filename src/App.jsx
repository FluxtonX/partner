import "./App.css";
import { LanguageProvider } from "@/components/providers/LanguageContext";
import Pages from "@/pages/index.jsx";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <LanguageProvider>
      <Pages />
      <Toaster />
    </LanguageProvider>
  );
}

export default App;
