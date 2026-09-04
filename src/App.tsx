import { Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { GastosPage } from "./pages/GastosPage";
import { DevedoresPage } from "./pages/DevedoresPage";
import { DevedorDetailPage } from "./pages/DevedorDetailPage";

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/gastos" element={<GastosPage />} />
              <Route path="/devedores" element={<DevedoresPage />} />
              <Route path="/devedores/:id" element={<DevedorDetailPage />} />
              <Route path="/" element={<Navigate to="/gastos" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
