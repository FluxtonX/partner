

// Section 1: Supplier Logos Marquee
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

  // Duplicate for seamless loop
  const allSuppliers = [...suppliers, ...suppliers];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-white via-neutral-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h2 className="text-heading-lg lg:text-display-sm text-center text-neutral-900 font-bold">
          Integrated with top{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
            construction suppliers
          </span>
        </h2>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        <div className="flex animate-marquee">
          {allSuppliers.map((supplier, index) => (
            <div
              key={index}
              className="flex-shrink-0 mx-8 w-40 h-24 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
            >
              <img
                src={supplier.logo}
                alt={supplier.name}
                className="max-w-full max-h-full object-contain opacity-60 hover:opacity-100 transition-opacity"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${supplier.name}&size=200&background=00f074&color=fff`;
                }}
              />
            </div>
          ))}
        </div>

        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};
export default SupplierMarquee