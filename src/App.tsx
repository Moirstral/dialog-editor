import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import EditorPage from "@/pages/editor.tsx";
import NotFoundPage from "@/pages/404.tsx";
import DefaultLayout from "@/layouts/default.tsx";

function App() {
  return (
    <Routes>
      <Route element={<NotFoundPage />} path="/404/:url" />
      <Route element={<DefaultLayout />}>
        <Route element={<IndexPage />} path="/" />
        <Route element={<EditorPage />} path="/:id" />
      </Route>
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  );
}

export default App;
