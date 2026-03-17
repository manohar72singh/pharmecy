import React from "react";

// ─── Configuration ────────────────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  brand: {
    name: "MediShop",
    tagline: "Your trusted online pharmacy for genuine medicines.",
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
        { label: "Home", href: "#" },
        { label: "Medicines", href: "#" },
        { label: "Offers", href: "#" },
        { label: "About Us", href: "#" },
      ],
    },
    {
      title: "My Account",
      links: [
        { label: "Login", href: "#" },
        { label: "Register", href: "#" },
        { label: "My Orders", href: "#" },
        { label: "Prescriptions", href: "#" },
      ],
    },
    {
      title: "Contact",
      links: [
        { label: "📞 9771157571", href: "tel:9771157571" },
        {
          label: "📧 manohar72singh@gmail.com",
          href: "mailto:manohar72singh@gmail.com",
        },
        { label: "🕐 24/7 Support", href: "#" },
      ],
    },
  ],
  copyright: "© 2024 MediShop. All rights reserved. | Licensed Pharmacy",
};
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Footer — Reusable pharmacy footer component.
 *
 * Props:
 *  @param {object}   brand          - Brand config (name, tagline, logo)
 *  @param {Array}    columns        - Nav columns [{title, links:[{label,href}]}]
 *  @param {string}   copyright      - Copyright text shown at bottom
 *  @param {string}   className      - Extra Tailwind classes for the <footer> element
 */
const Footer = ({
  brand = DEFAULT_CONFIG.brand,
  columns = DEFAULT_CONFIG.columns,
  copyright = DEFAULT_CONFIG.copyright,
  className = "",
}) => {
  return (
    <footer className={`bg-gray-900 text-gray-400 py-10 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: brand.logo.gradient }}
              >
                <span
                  className="font-black text-sm"
                  style={{ color: brand.logo.textColor }}
                >
                  {brand.logo.text}
                </span>
              </div>
              <span className="text-white font-black">{brand.name}</span>
            </div>
            <p className="text-xs leading-relaxed">{brand.tagline}</p>
          </div>

          {/* Dynamic Nav Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h5 className="text-white font-bold text-sm mb-3">{col.title}</h5>
              {col.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href ?? "#"}
                  className="block text-xs py-1 hover:text-white cursor-pointer transition-colors duration-150"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 text-center text-xs">
          {copyright}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
