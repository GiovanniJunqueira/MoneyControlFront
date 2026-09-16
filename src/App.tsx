import { Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/AppLayout";
import { HomeLayout } from "./components/HomeLayout";
import { BetsLayout } from "./components/BetsLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HomePage } from "./pages/HomePage";
import { OverviewPage } from "./pages/OverviewPage";
import { DevedoresGeralPage } from "./pages/DevedoresGeralPage";
import { GastosPage } from "./pages/GastosPage";
import { DevedoresPage } from "./pages/DevedoresPage";
import { DevedorDetailPage } from "./pages/DevedorDetailPage";
import { BetsHomePage } from "./pages/BetsHomePage";
import { BetMonthDetailPage } from "./pages/BetMonthDetailPage";
import { BetCompetitionsPage } from "./pages/BetCompetitionsPage";
import { BetCompetitionDetailPage } from "./pages/BetCompetitionDetailPage";

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<HomeLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/visao-geral" element={<OverviewPage />} />
              <Route path="/devedores" element={<DevedoresGeralPage />} />
            </Route>

            <Route element={<AppLayout />}>
              <Route path="/tabs/:tabId/gastos" element={<GastosPage />} />
              <Route path="/tabs/:tabId/devedores" element={<DevedoresPage />} />
              <Route path="/tabs/:tabId/devedores/:id" element={<DevedorDetailPage />} />
            </Route>

            <Route element={<BetsLayout />}>
              <Route path="/bets" element={<BetsHomePage />} />
              <Route path="/bets/months/:monthId" element={<BetMonthDetailPage />} />
              <Route path="/bets/competitions" element={<BetCompetitionsPage />} />
              <Route path="/bets/competitions/:id" element={<BetCompetitionDetailPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
