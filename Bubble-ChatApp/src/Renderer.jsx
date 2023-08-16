import RegisterandLoginForm from "./components/Register/RegisterandLoginForm";
import Chat from "./components/Chat/Chat";
import { BrowserRouter, Route, Routes } from "react-router-dom";

export default function Renderer() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegisterandLoginForm />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
} 