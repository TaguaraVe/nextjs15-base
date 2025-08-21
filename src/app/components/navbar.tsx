"use client";

import { Button } from "@/components/ui/button";
import { Blocks } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "./toggle-theme";

interface NavLink {
  name: string;
  href: string;
}

interface NavbarProps {
  domainName?: string;
  logo?: React.ReactNode;
  navLinks?: NavLink[];
  authLinks?: {
    login: { text: string; href: string };
    register: { text: string; href: string };
  };
  className?: string;
}

const Header = ({
  domainName = "Boxi Sleep",
  logo = <Blocks size={30} />,
  navLinks = [
    { name: "Home", href: "#" },
    { name: "About Us", href: "#" },
    { name: "Contact Us", href: "#" },
  ],
  authLinks = {
    login: { text: "Login", href: "#" },
    register: { text: "Register", href: "#" },
  },
  className = "",
}: NavbarProps) => {
  return (
    <nav className={`flex items-center justify-between px-6 py-4 ${className}`}>
      {/* Logo + Domain name */}
      <div className="flex items-center justify-center gap-2">
        {logo}

        <h1 className="text-2xl font-bold">{domainName}</h1>
      </div>

      {/* Navigation Links */}
      <div className="text-muted-foreground flex items-center space-x-8 text-sm opacity-85">
        <div className="hidden space-x-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Auth Links */}
      <div className="flex items-center space-x-4">
        <Button className="h-10" variant="outline" asChild>
          <Link href={authLinks.login.href}>{authLinks.login.text}</Link>
        </Button>

        <Button className="h-10" asChild>
          <Link href={authLinks.register.href}>{authLinks.register.text}</Link>
        </Button>
        <ModeToggle />
      </div>
    </nav>
  );
};

export default Header;
