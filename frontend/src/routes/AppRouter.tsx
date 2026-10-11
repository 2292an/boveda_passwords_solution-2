import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import VaultPage from "../pages/VaultPage";
import NotFoundPage from "../pages/NotFoundPage";

export default function AppRouter() {
  return <BrowserRouter><Layout><Routes>
    <Route path="/" element={<VaultPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes></Layout></BrowserRouter>;
}
