import React, { useState, useEffect } from "react";

const CustomerReviews = () => {
  const [currentReview, setCurrentReview] = useState(0);

  const REVIEWS = [
    {
      text: "MediShop has been a lifesaver! Fast delivery and genuine medicines every time. Highly recommended!",
      name: "Priya Sharma",
      location: "Mumbai, Maharashtra",
      date: "2 days ago",
      avatar: "PS",
    },
    {
      text: "Best online pharmacy I've used. The discounts are amazing and customer service is top-notch!",
      name: "Rajesh Kumar",
      location: "Delhi, NCR",
      date: "1 week ago",
      avatar: "RK",
    },
    {
      text: "Quick delivery and authentic products. My go-to for all medical needs. Very satisfied!",
      name: "Anjali Patel",
      location: "Bangalore, Karnataka",
      date: "3 days ago",
      avatar: "AP",
    },
    {
      text: "Excellent service! Got my medicines within hours. The quality is guaranteed and prices are great.",
      name: "Vikram Singh",
      location: "Pune, Maharashtra",
      date: "5 days ago",
      avatar: "VS",
    },
  ];

  const AVATAR_COLORS = [
    "bg-gradient-to-br from-emerald-500 to-teal-600",
    "bg-gradient-to-br from-blue-500 to-indigo-600",
    "bg-gradient-to-br from-purple-500 to-pink-600",
    "bg-gradient-to-br from-orange-500 to-red-600",
  ];

  // Auto-rotate reviews every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % REVIEWS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-1 sm:mb-2 tracking-tight">
          What Our Customers Say 💚
        </h2>
        <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-1 sm:mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="#fbbf24"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="text-[10px] sm:text-xs font-medium text-gray-500">
          Rated 4.9/5 by{" "}
          <span className="font-bold text-emerald-600">2,547+ customers</span>
        </p>
      </div>

      <div className="relative">
        {/* Review Card */}
        <div
          className="rounded-xl sm:rounded-2xl border-2 p-4 sm:p-6 shadow-lg relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
            borderColor: "#a7f3d0",
          }}
        >
          <div
            className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 opacity-10 rounded-full blur-2xl"
            style={{
              background: "radial-gradient(circle, #059669, transparent)",
              transform: "translate(30%, -30%)",
            }}
          />

          {/* Stars */}
          <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4 relative z-10">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>

          {/* Review Text */}
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-4 sm:mb-5 italic font-medium min-h-[50px] sm:min-h-[60px] relative z-10">
            "{REVIEWS[currentReview].text}"
          </p>

          {/* User Info */}
          <div
            className="flex items-center justify-between pt-3 sm:pt-4 border-t-2 relative z-10"
            style={{ borderColor: "#d1fae5" }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${AVATAR_COLORS[currentReview]} flex items-center justify-center shadow-md border-2 border-white ring-2 ring-emerald-100`}
              >
                <span className="text-white font-black text-xs sm:text-sm drop-shadow-sm">
                  {REVIEWS[currentReview].avatar}
                </span>
              </div>
              <div>
                <p className="font-black text-gray-900 text-xs sm:text-sm">
                  {REVIEWS[currentReview].name}
                </p>
                <p className="text-[10px] sm:text-xs text-emerald-600 font-semibold">
                  📍 {REVIEWS[currentReview].location}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] sm:text-[10px] text-gray-400 font-medium">
                {REVIEWS[currentReview].date}
              </p>
              <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                <svg
                  className="w-3 h-3 text-emerald-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-5">
          {REVIEWS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentReview(index)}
              className={`transition-all ${
                index === currentReview
                  ? "w-6 sm:w-8 h-1.5 sm:h-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                  : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-300 rounded-full hover:bg-gray-400"
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Trust Badge */}
      <div className="text-center mt-5 sm:mt-6">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-full shadow-sm">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-[10px] sm:text-xs font-black text-emerald-700">
            Trusted by 50,000+ Happy Customers
          </span>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
