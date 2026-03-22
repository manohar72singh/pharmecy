import React from "react";

const WhyChooseUs = () => {
  const features = [
    {
      icon: "✅",
      title: "100% Genuine",
      desc: "Directly from verified distributors",
      color: "from-green-50 to-emerald-50",
      border: "border-green-200",
      iconBg: "bg-gradient-to-br from-green-100 to-emerald-100",
    },
    {
      icon: "🚚",
      title: "Fast Delivery",
      desc: "Same-day delivery within the city",
      color: "from-blue-50 to-sky-50",
      border: "border-blue-200",
      iconBg: "bg-gradient-to-br from-blue-100 to-sky-100",
    },
    {
      icon: "💰",
      title: "Best Prices",
      desc: "Up to 25% off on all medicines",
      color: "from-amber-50 to-yellow-50",
      border: "border-amber-200",
      iconBg: "bg-gradient-to-br from-amber-100 to-yellow-100",
    },
    {
      icon: "🔒",
      title: "Secure & Safe",
      desc: "Fully encrypted & protected",
      color: "from-purple-50 to-violet-50",
      border: "border-purple-200",
      iconBg: "bg-gradient-to-br from-purple-100 to-violet-100",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12 mb-12 sm:mb-16">
      <h2 className="text-xl sm:text-2xl font-black text-gray-900 text-center mb-6 sm:mb-8 tracking-tight">
        Why Choose MediShop?
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className={`bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl border-2 ${feature.border} p-4 sm:p-5 text-center hover:shadow-xl transition-all hover:-translate-y-1 cursor-default group`}
          >
            <div
              className={`text-2xl sm:text-3xl mb-2 sm:mb-3 ${feature.iconBg} w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform border border-white/50`}
            >
              {feature.icon}
            </div>
            <h4 className="font-black text-gray-900 text-xs sm:text-sm mb-1 tracking-tight">
              {feature.title}
            </h4>
            <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed font-medium">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
