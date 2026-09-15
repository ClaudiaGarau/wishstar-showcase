import { useEffect } from "react";
import { NavLink, Route, BrowserRouter, Routes, useLocation } from "react-router-dom";
import { IntroOverlay } from "./components/IntroOverlay";
import { useCustomization } from "./hooks/useCustomization";
import { useTheme } from "./hooks/useTheme";
import { FriendsPage } from "./pages/FriendsPage";
import { MannequinPage } from "./pages/MannequinPage";
import { ProfilePage } from "./pages/ProfilePage";
import { QuickAddPage } from "./pages/QuickAddPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SharedWishlistPage } from "./pages/SharedWishlistPage";
import { WishlistDetailPage } from "./pages/WishlistDetailPage";
import { WishlistListPage } from "./pages/WishlistListPage";
import { startReactiveServices } from "./services/container";

function navLinkClass({ isActive }: { isActive: boolean }): string | undefined {
  return isActive ? "active" : undefined;
}

function AppRoutes() {
  const location = useLocation();
  return (
    <div className="app-main-container" key={location.pathname}>
      <Routes>
        <Route path="/" element={<WishlistListPage />} />
        <Route path="/wishlists/:id" element={<WishlistDetailPage />} />
        <Route path="/s/:token" element={<SharedWishlistPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/friends" element={<FriendsPage />} />
        <Route path="/mannequin" element={<MannequinPage />} />
        <Route path="/quick-add" element={<QuickAddPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
}

export function App() {
  useTheme();
  const { customization } = useCustomization();

  useEffect(() => {
    return startReactiveServices();
  }, []);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {customization.backgroundImage && (
        <div
          className="custom-background"
          style={{
            backgroundImage: `url(${customization.backgroundImage})`,
            opacity: customization.backgroundOpacity,
          }}
        />
      )}
      <div className="app-shell">
        <IntroOverlay />
        <header className="app-header">
          <span className="app-title">✨ WishStar</span>
          <nav className="app-nav">
            <NavLink to="/" end className={navLinkClass}>
              Le mie liste
            </NavLink>
            <NavLink to="/profile" className={navLinkClass}>
              Profilo
            </NavLink>
            <NavLink to="/friends" className={navLinkClass}>
              Amici
            </NavLink>
            <NavLink to="/mannequin" className={navLinkClass}>
              Manichino
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              Impostazioni
            </NavLink>
          </nav>
        </header>
        <main className="app-main">
          <AppRoutes />
        </main>
        <nav className="mobile-tabbar">
          <div className="mobile-tabbar-inner">
            <NavLink to="/" end className={navLinkClass}>
              <span>✨</span>
              Liste
            </NavLink>
            <NavLink to="/profile" className={navLinkClass}>
              <span>💜</span>
              Profilo
            </NavLink>
            <NavLink to="/friends" className={navLinkClass}>
              <span>🌸</span>
              Amici
            </NavLink>
            <NavLink to="/mannequin" className={navLinkClass}>
              <span>👗</span>
              Manichino
            </NavLink>
            <NavLink to="/settings" className={navLinkClass}>
              <span>⚙️</span>
              Impostazioni
            </NavLink>
          </div>
        </nav>
      </div>
    </BrowserRouter>
  );
}
