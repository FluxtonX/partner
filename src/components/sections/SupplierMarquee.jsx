import React from 'react';
import { CheckCircle2 } from 'lucide-react';

const SupplierMarquee = () => {
  const suppliers = [
    { name: 'Sherwin Williams', logo: 'https://logo.clearbit.com/sherwin-williams.com' },
    { name: 'Pella', logo: 'https://logo.clearbit.com/pella.com' },
    { name: 'Simpson', logo: 'https://logo.clearbit.com/strongtie.com' },
    { name: 'Mohawk', logo: 'https://logo.clearbit.com/mohawkind.com' },
    { name: 'USG', logo: 'https://logo.clearbit.com/usg.com' },
    { name: 'Kohler', logo: 'https://logo.clearbit.com/kohler.com' },
    { name: 'Boise Cascade', logo: 'https://logo.clearbit.com/bc.com' },
    { name: 'Southwire', logo: 'https://logo.clearbit.com/southwire.com' },
  ];

  const allSuppliers = [...suppliers, ...suppliers];

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-accent-orange to-accent-yellow rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
            <CheckCircle2 className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-bold text-white">Trusted Partnerships</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-white leading-tight">
            Integrated with top{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
              construction suppliers
            </span>
          </h2>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
            Seamlessly connect with industry-leading suppliers for accurate pricing
          </p>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        <div className="flex animate-marquee">
          {allSuppliers.map((supplier, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-10 w-48 h-32 flex items-center justify-center group"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white hover:border-white transition-all duration-300 w-full h-full flex items-center justify-center">
                <img
                  src={supplier.logo}
                  alt={supplier.name}
                  className="max-w-full max-h-full object-contain opacity-50 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${supplier.name}&size=200&background=00f074&color=fff&bold=true`;
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-neutral-900 to-transparent pointer-events-none z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-neutral-900 to-transparent pointer-events-none z-10"></div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mb-2">50+</div>
            <div className="text-neutral-400 font-semibold">Integrations</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-accent-yellow mb-2">99.9%</div>
            <div className="text-neutral-400 font-semibold">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-purple to-accent-blue mb-2">Real-time</div>
            <div className="text-neutral-400 font-semibold">Pricing</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 mb-2">24/7</div>
            <div className="text-neutral-400 font-semibold">Support</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default SupplierMarquee;