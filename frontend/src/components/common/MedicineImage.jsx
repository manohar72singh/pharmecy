// ── Reusable Medicine Image Component ────────────────
// Jab image load fail ho toh emoji fallback dikhata hai

const CATEGORY_EMOJI = {
  medicines: "💊",
  healthcare: "🩺",
  "personal-care": "🧴",
  "vitamins-supplements": "💪",
  "baby-care": "👶",
  "diabetic-care": "🩸",
  surgical: "🩹",
  ayurvedic: "🌿",
  "eye-ear-care": "👁️",
  "heart-bp": "❤️",
};

export default function MedicineImage({
  src,
  alt = "Medicine",
  categorySlug = "",
  className = "",
  size = "md", // sm | md | lg
}) {
  const emoji = CATEGORY_EMOJI[categorySlug] || "💊";

  const sizeMap = {
    sm: "text-3xl",
    md: "text-5xl",
    lg: "text-8xl",
  };

  if (!src) {
    return <span className={`${sizeMap[size]} ${className}`}>{emoji}</span>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      onError={(e) => {
        // Image load fail → emoji replace
        e.target.style.display = "none";
        e.target.parentNode.innerHTML = `<span class="${sizeMap[size]}">${emoji}</span>`;
      }}
    />
  );
}
