"use client";

import Link from "next/link";
import { Blocks, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./theme/toggle-theme";
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
    { name: "Inicio", href: "/" },
    { name: "Nosotros", href: "/about" },
    { name: "Contacto", href: "/contact" },
  ],
  authLinks = {
    login: { text: "Login", href: "/login" },
    register: { text: "Register", href: "/register" },
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
        <div className="flex gap-2">
          <Link href="/products">
            <Button variant="outline" size="sm">
              <Package className="mr-2 h-4 w-4" />
              Gestionar Productos
            </Button>
          </Link>
        </div>

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
