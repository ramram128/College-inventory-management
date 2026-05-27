import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { FacilitiesPage } from "./pages/FacilitiesPage";
import { EquipmentPage } from "./pages/EquipmentPage";
import { BookingPage } from "./pages/BookingPage";
import { BookingsPage } from "./pages/BookingsPage";
import { AuthPage } from "./pages/AuthPage";
import { AdminPage } from "./pages/admin/AdminPage";
import { CombinedAddPage } from "./pages/admin/CombinedAddPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ResearchOutcomePage } from "./pages/ResearchOutcomePage";

export const router = createBrowserRouter([
  // Auth pages — standalone, no sidebar/navbar
  { path: "/login", Component: AuthPage },
  { path: "/register", Component: AuthPage },
  // All other pages — wrapped in Layout
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "facilities", Component: FacilitiesPage },
      { path: "equipment", Component: EquipmentPage },
      { path: "booking", Component: BookingPage },
      { path: "my-bookings", Component: BookingsPage },
      { path: "settings", Component: SettingsPage },
      { path: "research-outcome", Component: ResearchOutcomePage },
      { path: "admin", Component: AdminPage },
      { path: "admin/add-equipment", Component: CombinedAddPage },
      { path: "admin/edit-equipment/:id", Component: CombinedAddPage },
      { path: "admin/add-facility", Component: CombinedAddPage },
      { path: "admin/edit-facility/:id", Component: CombinedAddPage },
    ],
  },
]);
