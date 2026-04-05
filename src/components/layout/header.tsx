"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bell, Search, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppStore } from "@/stores/app-store";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { logout, isLoading } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  const handleSignOut = async () => {
    await logout();
    setShowLogoutDialog(false);
    router.push("/login");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-[75px] items-center justify-between bg-white border-b border-gray-200 px-6 transition-all duration-300",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          {title && (
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search..."
            className="h-9 w-60 pl-9 text-sm border-gray-200 bg-gray-50 focus:bg-white"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Bell className="h-5 w-5 text-gray-500" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
              <span className="font-medium text-sm">New application received</span>
              <span className="text-xs text-gray-500">John Doe applied for Senior Developer</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
              <span className="font-medium text-sm">Interview scheduled</span>
              <span className="text-xs text-gray-500">Tomorrow at 2:00 PM</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm text-gray-500">
              View all
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* TUV-Nord Logo & Logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
          <Image
            src="/images/tuv-nord-logo.png"
            alt="TUV Nord"
            width={100}
            height={32}
            className="h-8 w-auto object-contain"
          />

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowLogoutDialog(true)}
            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Logout Dialog */}
        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent className="sm:max-w-[380px]">
            <DialogHeader>
              <DialogTitle>Sign out</DialogTitle>
              <DialogDescription>
                Are you sure you want to sign out?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowLogoutDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleSignOut}
                disabled={isLoading}
              >
                {isLoading ? "Signing out..." : "Sign out"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
