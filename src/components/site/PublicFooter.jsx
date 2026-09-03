import React from "react";
import { Link } from "react-router-dom";
import { Mail, Scale } from "lucide-react";
import Logo from "./Logo";
import { SITE } from "@/lib/siteContent";

export default function PublicFooter() {
  const email = SITE.email;
  return (
    <footer className="bg-navy text-white">
      <div className="border-t border-white/10">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-16 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo variant="light" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              Accident Compensation Helper provides a free, confidential claim check and, if you choose, can help you
              request contact with participating attorneys. We are not a law firm and do not provide legal advice.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Explore</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
              <li><Link to="/accident-types" className="hover:text-white">Accident Types</Link></li>
              <li><Link to="/resources" className="hover:text-white">Resources</Link></li>
              <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Legal and Privacy</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link to="/privacy-choices" className="hover:text-white">Your Privacy Choices</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Transparency</h3>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
            <div className="mt-5 space-y-2 text-sm text-white/70">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand" /> {email}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-white/45 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Accident Compensation Helper. All rights reserved.</p>
          <p className="flex items-center gap-2 text-center sm:text-right">
            <Scale className="h-3.5 w-3.5 shrink-0" />
            This website is not a law firm and does not provide legal advice. No attorney-client relationship is created by using this site.
          </p>
        </div>
      </div>
    </footer>
  );
}