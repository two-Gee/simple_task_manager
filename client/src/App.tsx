import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import ListPage from "@/pages/list";
import { LoginModal } from "./components/login-modal";
import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <UserProvider>
        <LoginModal />
        <Routes>
        <Route element={<IndexPage />} path="/" />
        <Route element={<ListPage />} path="/docs" />
      </Routes>
    </UserProvider>
  );
}

export default App;
