import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import EditorPage from "@/pages/editor.tsx";
import NotFoundPage from "@/pages/404.tsx";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<EditorPage />} path="/:id" />
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  );
}

export default App;
