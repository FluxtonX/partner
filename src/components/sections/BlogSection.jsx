import React from 'react';
import { ArrowRight, Clock, Calendar, Megaphone, Lightbulb, TrendingUp } from 'lucide-react';

const BlogSection = () => {
  const blogPosts = [
    {
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop',
      category: 'Marketing',
      title: '20 Proven Marketing Strategies for General Contractors to Get More Customers',
      excerpt: '20 proven marketing strategies for general contractors to get more customers, boost visibility, and grow consistently.',
      author: 'Sarah Johnson',
      date: 'Mar 15, 2024',
      readTime: '8 min read',
      gradient: 'from-primary-500 to-primary-600',
      icon: Megaphone,
    },
    {
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      category: 'Technology',
      title: 'ChatGPT for Remodelers: How AI Saves Time, Reduces Admin, and Boosts Profit',
      excerpt: 'Learn how remodelers use ChatGPT to save hours, cut admin, improve client communication, and boost profit.',
      author: 'Mike Chen',
      date: 'Mar 12, 2024',
      readTime: '6 min read',
      gradient: 'from-accent-purple to-accent-blue',
      icon: Lightbulb,
    },
    {
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
      category: 'Strategy',
      title: 'Stop Wasting Bids: 7 Ways to Win More Remodeling Projects Without Lowering Your Prices',
      excerpt: 'Win more remodeling bids without lowering your prices. Learn 7 proven strategies contractors use to respond faster.',
      author: 'David Martinez',
      date: 'Mar 10, 2024',
      readTime: '10 min read',
      gradient: 'from-accent-orange to-accent-yellow',
      icon: TrendingUp,
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-primary-50/30 via-white to-secondary-50/30 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 border border-primary-200 rounded-full backdrop-blur-sm">
            <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
              <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
            </svg>
            <span className="text-sm font-bold text-primary-700">From Our Blog</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-black text-neutral-900">
            Latest{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
              Insights
            </span>
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Expert articles that help contractors grow and leverage technology in their businesses
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {blogPosts.map((post, index) => {
            const IconComponent = post.icon;
            return (
              <article
                key={index}
                className="group bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 border-neutral-100"
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
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
                      <IconComponent className="w-8 h-8" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-6 right-6">
                    <span className="px-5 py-2 bg-white/95 backdrop-blur-sm text-neutral-900 rounded-2xl text-sm font-black shadow-xl">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-4">
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-neutral-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span className="font-semibold">{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">{post.readTime}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-black text-neutral-900 line-clamp-2 group-hover:text-primary-600 transition-colors leading-tight">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-neutral-600 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Author & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-neutral-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${post.gradient} rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg`}>
                        {post.author.charAt(0)}
                      </div>
                      <span className="text-sm text-neutral-700 font-bold">
                        {post.author}
                      </span>
                    </div>

                    <button className="inline-flex items-center gap-2 text-primary-600 font-bold text-sm hover:gap-3 transition-all group/link">
                      Read
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center mb-20">
          <button className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-primary hover:scale-105 transition-all duration-300">
            <span>View All Articles</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-[2rem] p-10 lg:p-14 text-center shadow-2xl border-2 border-neutral-700">
          <h3 className="text-3xl lg:text-4xl font-black text-white mb-4">
            Never Miss an Update
          </h3>
          <p className="text-neutral-300 mb-8 max-w-2xl mx-auto text-lg">
            Subscribe to our newsletter and get the latest tips, strategies, and industry insights delivered straight to your inbox.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-2xl border-2 border-neutral-700 bg-white/5 backdrop-blur-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-colors font-semibold"
              />
              <button className="px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-2xl hover:from-primary-600 hover:to-secondary-600 transition-all hover:scale-105 shadow-2xl">
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