export default function CallToAction() {
  return (
    <section className="cta-bg text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-5xl font-bold mb-6">Ready to Start Your Hydroponic Journey?</h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Join thousands of successful farmers who have transformed their agriculture with our hydroponic solutions.
        </p>
        <div className="flex justify-center space-x-4">
          <button 
            className="bg-[#133903] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#6a9f24] transition-colors"
            data-testid="button-get-started"
          >
            Get Started Now
          </button>
          <button 
            className="bg-white text-[#2E593F] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            data-testid="button-contact-us"
          >
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
}
