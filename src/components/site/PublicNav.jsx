import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ShieldCheck } from "lucide-react";
import Logo from "./Logo";
import { NAV_LINKS, QUIZ_URL } from "@/lib/siteContent";
import { cn } from "@/lib/utils";

export default function PublicNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { hash } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
  }, [hash]);

  return (
    <>
      <header className={cn("fixed inset-x-0 top-0 z-50 bg-navy transition-shadow", scrolled && "shadow-lift")}>
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex items-center" aria-label="Accident Compensation Helper home">
            <Logo variant="light" />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.label}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3.5 py-2 text-[15px] font-medium text-white/75 transition-colors hover:text-white",
                    isActive && "text-white"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden lg:block">
            <a
              href={QUIZ_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lift transition-transform hover:scale-[1.03] hover:bg-brand-hover"
            >
              Check My Claim
            </a>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-navy/90 backdrop-blur-xl" onClick={() => setOpen(false)} />
          <div className="relative flex h-full flex-col bg-navy px-6 pt-6">
            <div className="flex items-center justify-between">
              <Logo variant="light" />
              <button onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-lg text-white" aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-10 flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-lg font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pb-10">
              <a
                href={QUIZ_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-4 text-base font-semibold text-white shadow-lift"
              >
                Check My Claim
              </a>
              <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/55">
                <ShieldCheck className="h-3.5 w-3.5" /> Free and confidential. No obligation.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}