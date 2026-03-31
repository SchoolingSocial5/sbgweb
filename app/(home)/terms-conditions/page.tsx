// 'use client'
// import { PolicyStore } from '@/src/zustand/app/Policy'

// const Terms: React.FC = () => {
//   const { selectedTerms, terms, selectTerm } = PolicyStore()

//   return (
//     <>

//     </>
//   )
// }

// export default Terms
import React from 'react';

const TermsAndConditions = () => {
  const sections = [
    {
      title: "1. Introduction",
      content: "Welcome to Awiza Farms Ltd. These Terms and Conditions govern your use of our website and the purchase of our poultry products, including eggs, live birds, and day-old chicks."
    },
    {
      title: "2. Product Orders & Availability",
      content: "All orders are subject to availability. Prices are subject to change without notice due to fluctuations in feed costs and market demand within the Nigerian agricultural sector."
    },
    {
      title: "3. Delivery & Live Bird Policy",
      content: "We deliver across Nigeria. Note that risk of loss for live birds passes to the customer upon dispatch. Reports of egg breakage exceeding 2% must be made within 2 hours of receipt."
    },
    {
      title: "4. Payments",
      content: "Payments are processed through secure Nigerian gateways. Orders are confirmed and dispatched only after funds are verified."
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Hero Section */}
      <div
        className="relative py-20 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/terms.jpg')" }}
      >
        {/* Dark Overlay to make text pop */}
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Terms & Conditions
          </h1>
          <p className="text-teal-50 font-medium">
            Last Updated: February 7, 2026 • Legal Framework for Awiza Farms Ltd
          </p>
        </div>
      </div>

      {/* Content Section */}
      <main className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-gray-100">
          <p className="text-gray-600 mb-10 leading-relaxed">
            Please read these terms carefully before using our services. By using Awiza Farms,
            you agree to follow our guidelines regarding poultry safety, payments, and logistics.
          </p>

          <div className="space-y-12">
            {sections.map((section, index) => (
              <section key={index} className="border-l-4 border-[var(--customRedColor)] pl-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {section.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {section.content}
                </p>
              </section>
            ))}
          </div>

          <div className="mt-16 p-6 bg-orange-50 rounded-xl border border-orange-100 text-center">
            <p className="text-[var(--customRedColor)] font-medium">
              Have questions about our legal terms?
            </p>
            <a
              href="mailto:support@Awizafarms.com"
              className="text-[var(--customRedColor)] underline font-bold"
            >
              Contact our Legal Team
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsAndConditions;