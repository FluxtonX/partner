import {Button} from "../ui/button";
const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Business?
        </h2>
        <p className="text-xl text-primary-100 mb-8">
          Join thousands of contractors who are already using Partner to win more deals and deliver better projects.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="secondary" size="lg">
            Start Free Trial
          </Button>
          <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all text-lg backdrop-blur-sm border-2 border-white/30">
            Schedule Demo
          </button>
        </div>
      </div>
    </section>
  );
};
export default CTA