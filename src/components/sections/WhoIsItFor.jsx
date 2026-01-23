
import { ArrowRight } from 'lucide-react';

const WhoIsItFor = () => {
  const audiences = [
    {
      title: 'Remodelers',
      description: 'Grow your business without adding overhead',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
      color: 'from-primary-500 to-primary-600'
    },
    {
      title: 'Handyman',
      description: 'Bid on bigger jobs with confidence',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=600&fit=crop',
      color: 'from-secondary-500 to-secondary-600'
    },
    {
      title: 'Fix and Flip',
      description: 'Instantly assess investment opportunities and get funded',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
      color: 'from-accent-orange to-accent-yellow'
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-neutral-50 via-white to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-display-sm lg:text-display-md text-neutral-900 font-bold mb-4">
            Who is  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
             Partner for ?
          </span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            If you are an owner of a residential construction business, Partner is for you. 
            Supercharge your growth and let us handle your operations on autopilot.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {audiences.map((audience, index) => (
            <div
              key={index}
              className="group relative rounded-3xl overflow-hidden shadow-large hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Image */}
              <div className="relative h-96 overflow-hidden">
                <img
                  src={audience.image}
                  alt={audience.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-heading-md text-white font-bold mb-2">
                  {audience.title}
                </h3>
                <p className="text-white/90 mb-4 leading-relaxed">
                  {audience.description}
                </p>
                <button className="inline-flex items-center gap-2 text-white font-semibold group-hover:gap-3 transition-all duration-300">
                  <span>Learn more</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Hover Border Effect */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${audience.color} opacity-10`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default WhoIsItFor