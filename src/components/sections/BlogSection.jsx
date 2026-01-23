import React from 'react';

const BlogSection = () => {
  const blogPosts = [
    {
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop',
      category: 'Marketing',
      title: '20 Proven Marketing Strategies for General Contractors to Get More Customers',
      excerpt: '20 proven marketing strategies for general contractors to get more customers, boost visibility, and grow consistently with simple, practical tactics.',
      author: 'Sarah Johnson',
      date: 'Mar 15, 2024',
      readTime: '8 min read',
      gradient: 'from-primary-500 to-primary-600',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
    {
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      category: 'Technology',
      title: 'ChatGPT for Remodelers: How AI Saves Time, Reduces Admin, and Boosts Profit',
      excerpt: 'Learn how remodelers use ChatGPT to save hours, cut admin, improve client communication, and boost profit with AI workflows built for construction.',
      author: 'Mike Chen',
      date: 'Mar 12, 2024',
      readTime: '6 min read',
      gradient: 'from-accent-purple to-accent-blue',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
      category: 'Strategy',
      title: 'Stop Wasting Bids: 7 Ways to Win More Remodeling Projects Without Lowering Your Prices',
      excerpt: 'Win more remodeling bids without lowering your prices. Learn 7 proven strategies contractors use to respond faster and close more high-margin projects.',
      author: 'David Martinez',
      date: 'Mar 10, 2024',
      readTime: '10 min read',
      gradient: 'from-accent-orange to-accent-yellow',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-white via-primary-50/20 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 font-semibold text-sm mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
              <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
            </svg>
            From Our Blog
          </div>

          <h2 className="text-display-sm lg:text-display-md text-neutral-900 font-bold mb-4">
            Blog
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Partner staff regularly publishes engaging articles that help contractors grow and leverage technology in their businesses.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {blogPosts.map((post, index) => (
            <article
              key={index}
              className="group bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-500 hover:-translate-y-2 animate-fade-in-up border border-neutral-100"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden aspect-[4/3]">
                <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient} opacity-90 mix-blend-multiply group-hover:opacity-80 transition-opacity`}></div>
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Icon Overlay */}
                <div className="absolute top-6 left-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-medium group-hover:scale-110 transition-transform">
                    {post.icon}
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-6 right-6">
                  <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-neutral-900 rounded-full text-sm font-semibold shadow-medium">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-heading-sm text-neutral-900 font-bold mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-neutral-600 mb-4 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Author & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {post.author.charAt(0)}
                    </div>
                    <span className="text-sm text-neutral-700 font-medium">
                      {post.author}
                    </span>
                  </div>

                  <button className="inline-flex items-center gap-2 text-primary-600 font-semibold text-sm hover:gap-3 transition-all group/link">
                    Read More
                    <svg className="w-4 h-4 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl shadow-primary hover:shadow-lg transition-all hover:scale-105">
            View All Articles
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-3xl p-8 lg:p-12 text-center animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
          <h3 className="text-heading-lg text-white font-bold mb-4">
            Never Miss an Update
          </h3>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest tips, strategies, and industry insights delivered straight to your inbox.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-colors"
              />
              <button className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-neutral-50 transition-all hover:scale-105 shadow-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;