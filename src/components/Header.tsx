"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { AuthModal } from "./AuthModal";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { Input } from "./ui/input"; // Import Input component
import { Search } from "lucide-react"; // Import Search icon

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

/**
 * Header with logo (left), nav (center), actions (right)
 */
const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, loading, signOut } = useAuth();
  const [avatarFilePath, setAvatarFilePath] = useState<string | null>(null);
  const [avatarSignedUrl, setAvatarSignedUrl] = useState<string | null>(null);
  const [signedUrlLoading, setSignedUrlLoading] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(""); // Add state for search query

  // Fetch avatar URL when user data is available
  useEffect(() => {
    if (user) {
      const supabase = createClient();
      const fetchAvatar = async () => {
          const { data } = await supabase.from('profiles').select('avatar_url').eq('id', user.id).single();
          if (data?.avatar_url) {
            setAvatarFilePath(data.avatar_url);
          } else {
            setAvatarFilePath(null);
            setAvatarSignedUrl(null);
          }
      }
      fetchAvatar();
    } else {
        setAvatarFilePath(null);
        setAvatarSignedUrl(null);
    }
  }, [user]);

  // Lấy signed URL khi avatarFilePath thay đổi
  useEffect(() => {
    const getSignedUrl = async () => {
      if (!avatarFilePath) {
        setAvatarSignedUrl(null);
        return;
      }
      setSignedUrlLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase.storage.from('avatars').createSignedUrl(avatarFilePath, 60 * 60);
      if (error || !data?.signedUrl) {
        setAvatarSignedUrl(null);
      } else {
        setAvatarSignedUrl(data.signedUrl);
      }
      setSignedUrlLoading(false);
    };
    getSignedUrl();
  }, [avatarFilePath]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="w-full h-16 flex items-center justify-between px-4 border-b sticky top-0 z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md shadow-sm">
      {/* Left: Logo */}
      <div className="flex items-center">
        <span className="text-xl font-bold tracking-tight text-primary">MovieApp</span>
      </div>
      {/* Center: Main nav */}
      <nav className="flex-1 flex justify-center gap-2">
        <Link href="/" className="text-lg font-semibold px-4 py-2 hover:text-primary transition">
          Home
        </Link>
        <Link href="/favorites" className="text-lg font-semibold px-4 py-2 hover:text-primary transition">
          Favorites
        </Link>
        <Link href="/recommended" className="text-lg font-semibold px-4 py-2 hover:text-primary transition">
          Phim gợi ý
        </Link>
      </nav>
      {/* Right: Toggle + Login/User info */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Search movies..."
            className="pl-9 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
        {/* Theme Toggle */}
        <button
          className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition w-9 h-9 flex items-center justify-center"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {mounted && (
            theme === "dark" ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )
          )}
        </button>
        {/* Auth Actions */}
        {loading ? (
            <div className="h-9 w-20 rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={signedUrlLoading ? '/no-avatar.png' : (avatarSignedUrl || '/no-avatar.png')} alt={user.email || ''} />
                        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">My Account</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <AuthModal>
            <Button variant="ghost">Log in</Button>
          </AuthModal>
        )}
      </div>
    </header>
  );
};

export default Header;