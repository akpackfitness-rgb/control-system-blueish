import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronRight,
  LogOut,
  Menu,
  Package,
  ScrollText,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { UserRole } from "../backend";
import type { PackId } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetCallerUserRole,
} from "../hooks/useQueries";
import AccessLog from "./AccessLog";
import ManageAccess from "./ManageAccess";
import PacksTab from "./PacksTab";
import UserManagement from "./UserManagement";

type Tab = "packs" | "access-log" | "user-management";

export default function Dashboard() {
  const { clear, identity } = useInternetIdentity();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("packs");
  const [managingPackId, setManagingPackId] = useState<PackId | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: userProfile } = useGetCallerUserProfile();
  const { data: userRole } = useGetCallerUserRole();
  const isAdmin = userRole === UserRole.admin;

  const handleLogout = async () => {
    await clear();
    qc.clear();
  };

  const navItems = [
    { id: "packs" as Tab, label: "Packs", icon: Package },
    { id: "access-log" as Tab, label: "Access Log", icon: ScrollText },
    ...(isAdmin
      ? [
          {
            id: "user-management" as Tab,
            label: "User Management",
            icon: UserCog,
          },
        ]
      : []),
  ];

  const principalStr = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal =
    principalStr.length > 16
      ? `${principalStr.slice(0, 8)}...${principalStr.slice(-6)}`
      : principalStr;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-sm tracking-wide">
                AK PACK
              </p>
              <p className="text-xs font-mono text-primary tracking-widest">
                ACCESS CTRL
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={`nav.${item.id}.link`}
                onClick={() => {
                  setActiveTab(item.id);
                  setManagingPackId(null);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {userProfile?.name ?? "Anonymous"}
              </p>
              <p className="text-xs font-mono text-muted-foreground truncate">
                {shortPrincipal}
              </p>
            </div>
          </div>
          {isAdmin && (
            <div className="px-3 mb-2">
              <span className="text-xs font-mono bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-sm">
                ADMIN
              </span>
            </div>
          )}
          <Button
            data-ocid="nav.logout.button"
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:text-foreground gap-3"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
          <button
            type="button"
            className="lg:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <div className="flex-1">
            {managingPackId !== null ? (
              <div className="flex items-center gap-2 text-sm">
                <button
                  type="button"
                  data-ocid="nav.packs.link"
                  onClick={() => setManagingPackId(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Packs
                </button>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-foreground font-medium">
                  Manage Access
                </span>
              </div>
            ) : (
              <h1 className="font-display font-semibold text-sm tracking-wide uppercase text-muted-foreground">
                {activeTab === "packs" && "Pack Management"}
                {activeTab === "access-log" && "Access Log"}
                {activeTab === "user-management" && "User Management"}
              </h1>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            {managingPackId !== null ? (
              <motion.div
                key="manage-access"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <ManageAccess
                  packId={managingPackId}
                  onBack={() => setManagingPackId(null)}
                  isAdmin={isAdmin}
                />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "packs" && (
                  <PacksTab
                    isAdmin={isAdmin}
                    onManageAccess={setManagingPackId}
                  />
                )}
                {activeTab === "access-log" && <AccessLog />}
                {activeTab === "user-management" && isAdmin && (
                  <UserManagement />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
