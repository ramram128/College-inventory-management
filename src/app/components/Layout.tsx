import { Outlet, Link, useLocation } from "react-router";
import { Navigation } from "./Navigation";
import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { Microscope, Home, Settings, Settings2, FlaskConical, Dna, Cpu, Atom, Monitor, ChevronDown, ChevronLeft, ChevronRight, User, LayoutGrid, Menu, SquarePen, Zap } from "lucide-react";
import { Navbar } from "./Navbar";
import { useAppContext } from "../context/AppContext";
import { UserMenu } from "./UserMenu";
import { useNavigate } from "react-router";
import { LogoutModal } from "./LogoutModal";

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const location = useLocation();
  const { currentUser, logout } = useAppContext();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith("/admin");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {!isAdminRoute && (
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex-none leading-none">
          <Navigation
            onLogoutClick={() => setIsLogoutOpen(true)}
          />
        </div>
      )}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Perfect Unified Sidebar Match */}
        {!isAdminRoute && (
          <aside
            className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50 ${isSidebarOpen ? "w-[280px]" : "w-18"
              }`}
          >
            {/* Header with Large Blue Toggle */}
            <div className="p-4 flex flex-col gap-6 shrink-0">
              <div className="flex justify-start">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-3 text-slate-500 hover:text-blue-600 transition-all duration-200 group"
                  title="Toggle Sidebar"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Navigation Content */}
            <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
              <div className="flex flex-col gap-1">
                {[
                  { name: "All Research Areas", icon: LayoutGrid, path: "/facilities/", state: { data: "All" } },
                  { name: "Chemistry Laboratory", icon: FlaskConical, path: "/facilities/", state: { data: "CHEMISTRY_LAB" } },
                  { name: "Biomedical Laboratory", icon: Dna, path: "/facilities/", state: { data: "BIOMEDICAL_LAB" } },
                  { name: "Electrical and Electronics Engineering Laboratory", icon: Zap, path: "/facilities/", state: { data: "EEE_LAB" } },
                  { name: "Electronics and Communication Engineering Laboratory", icon: Cpu, path: "/facilities/", state: { data: "ECE_LAB" } },
                  { name: "Physics Laboratory", icon: Atom, path: "/facilities/", state: { data: "PHYSICS_LAB" } },
                  { name: "Computing Laboratory", icon: Monitor, path: "/facilities/", state: { data: "COMPUTER_LAB" } },
                  { name: "Mechanical Engineering Laboratory", icon: Settings2, path: "/facilities/", state: { data: "MECHANICAL_LAB" } },
                ].map((area) => {
                  const activeData = location.state?.data;
                  const isActive = area.state
                    ? activeData === area.state.data
                    : (!activeData && location.pathname === area.path);

                  return (
                    <Sidebar.Item
                      key={area.name}
                      label={isSidebarOpen ? area.name : ""}
                      icon={area.icon}
                      to={area.path}
                      state={area.state}
                      isActive={isActive}
                    />
                  );
                })}
              </div>
            </div>

            {/* Bottom Menu Items */}
            <div className="px-4 py-2 border-t border-gray-100">
              <Sidebar.Item
                label={isSidebarOpen ? "Research Outcome" : ""}
                icon={SquarePen}
                to="/research-outcome"
                isActive={location.pathname === "/research-outcome"}
              />
            </div>

            {/* Profiles & Settings Card Footer */}
            <UserMenu
              variant="sidebar"
              isSidebarOpen={isSidebarOpen}
              onLogoutClick={() => setIsLogoutOpen(true)}
            />
          </aside>
        )}

        {/* Logout Modal */}
        <LogoutModal
          open={isLogoutOpen}
          onOpenChange={setIsLogoutOpen}
          onConfirm={handleLogout}
        />

        {/* Main Content Area */}
        <main className={`flex-1 ${isAdminRoute ? "overflow-hidden" : "overflow-y-auto scroll-smooth"} bg-white w-full pt-0`}>
          <div className="flex-1 h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
