import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import ListPage from "@/pages/list";
import { LoginModal } from "./components/loginModal";
import { UserProvider } from "./context/UserContext";
import { SocketListener } from "./hooks/socketListener";
import { HeroUIProvider } from "@heroui/system";

function App() {
  return (
    <HeroUIProvider locale="en-GB">
      <UserProvider>
        <LoginModal />
        <SocketListener />
        <Routes>
          <Route element={<IndexPage />} path="/" />
          <Route path="/list/:name" element={<ListPage />} />
        </Routes>
      </UserProvider>
    </HeroUIProvider>
  );
}

export default App;
