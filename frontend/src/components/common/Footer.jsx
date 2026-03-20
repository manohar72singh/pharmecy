import React from "react";

// ─── Configuration ────────────────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  brand: {
    name: "MediShop",
    tagline:
      "Your trusted partner for genuine medicines and healthcare essentials.",
    logo: {
      text: "Rx",
      gradient: "linear-gradient(135deg, #fbbf24, #f59e0b)",
      textColor: "#064e3b",
    },
  },
  columns: [
    {
      title: "Quick Links",
      links: [
        { label: "Home", href: "/" },
        { label: "Browse Medicines", href: "/medicines" },
        { label: "Exclusive Offers", href: "/offers" },
        { label: "About Our Pharmacy", href: "/about" },
      ],
    },
    {
      title: "Customer Support",
      links: [
        { label: "My Account", href: "/profile" },
        { label: "Order History", href: "/orders" },
        { label: "Track Prescription", href: "/prescription" },
        { label: "Privacy Policy", href: "/privacy" },
      ],
    },
    {
      title: "Contact Us",
      links: [
        { label: "📞 +91 9771157571", href: "tel:9771157571" },
        {
          label: "📧 support@medishop.com", // Professional placeholder
          href: "mailto:manohar72singh@gmail.com",
        },
        { label: "🕐 Available 24/7", href: "#" },
      ],
    },
  ],
  copyright: `© ${new Date().getFullYear()} MediShop. All rights reserved. | Licensed Pharmaceutical Provider`,
};
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Footer — Reusable pharmacy footer component.
 */
const Footer = ({
  brand = DEFAULT_CONFIG.brand,
  columns = DEFAULT_CONFIG.columns,
  copyright = DEFAULT_CONFIG.copyright,
  className = "",
}) => {
  return (
    <footer className={`bg-gray-900 text-gray-400 py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: brand.logo.gradient }}
              >
                <span
                  className="font-black text-sm"
                  style={{ color: brand.logo.textColor }}
                >
                  {brand.logo.text}
                </span>
              </div>
              <span className="text-white font-black text-lg tracking-tight">
                {brand.name}
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs">{brand.tagline}</p>
          </div>

          {/* Dynamic Nav Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h5 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
                {col.title}
              </h5>
              <nav className="space-y-2">
                {col.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href ?? "#"}
                    className="block text-xs hover:text-emerald-400 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center text-[10px] sm:text-xs tracking-wide">
          {copyright}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
