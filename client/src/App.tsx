import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import ListPage from "@/pages/list";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<ListPage />} path="/docs" />
    </Routes>
  );
}

export default App;
