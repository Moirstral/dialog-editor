import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import EditorPage from "@/pages/editor.tsx";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<EditorPage />} path="/editor/:id" />
    </Routes>
  );
}

export default App;
