"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Search, 
  Wand2, 
  GitCompare, 
  BarChart2, 
  Bookmark, 
  Building2,
  GraduationCap
} from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [bookmarkCount, setBookmarkCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      const saved = localStorage.getItem("csab_shortlist");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setBookmarkCount(parsed.length);
        } catch (e) {
          setBookmarkCount(0);
        }
      } else {
        setBookmarkCount(0);
      }
    };

    updateCount();
    window.addEventListener("storage", updateCount);
    const interval = setInterval(updateCount, 1000);
    return () => {
      window.removeEventListener("storage", updateCount);
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { name: "Finder", href: "/", icon: Search },
    { name: "College Wizard", href: "/wizard", icon: Wand2 },
    { name: "Compare", href: "/compare", icon: GitCompare },
    { name: "Analytics", href: "/analytics", icon: BarChart2 },
    { name: "Institutes", href: "/institutes", icon: Building2 },
    { 
      name: "Shortlist", 
      href: "/shortlist", 
      icon: Bookmark, 
      count: bookmarkCount 
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/[0.08]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-black text-white flex items-center justify-center font-bold shadow-sm">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-[#1d1d1f] tracking-tight leading-none">
                CSAB Vacancies
              </span>
              <span className="text-[10px] text-[#86868b] font-normal leading-tight">
                2026 Portal
              </span>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "bg-black/[0.06] text-[#1d1d1f] font-semibold"
                      : "text-[#515154] hover:text-[#1d1d1f] hover:bg-black/[0.03]"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-[#0071e3]" : "text-[#86868b]"}`} />
                  <span>{item.name}</span>

                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#0071e3] text-white">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <Link
              href="/wizard"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full bg-[#0071e3] text-white shadow-sm hover:bg-[#0077ed] transition-colors"
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span>Find My College</span>
            </Link>
          </div>
        </div>

        {/* Mobile Submenu */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-black/[0.06] no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap font-medium ${
                  isActive
                    ? "bg-black/[0.08] text-[#1d1d1f]"
                    : "text-[#6e6e73] hover:text-[#1d1d1f]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.name}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#0071e3] text-white">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
