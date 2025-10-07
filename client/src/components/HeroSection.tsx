export default function HeroSection() {
  return (
    <section className="hero-bg text-white relative">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center" style={{height: '700px'}}>
        <p className="text-lg mb-4">Hydroponic Garden & Horticulture</p>
        <h1 className="text-7xl font-bold leading-tight">
          Learn how to Organic <br />
          Fruit, Herbs & <br />
          Vegetable.
        </h1>
        <p className="mt-6 text-lg max-w-lg">
          Starting a hydroponic business can be an exciting and rewarding venture.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-full max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-white/20 rounded-xl overflow-hidden backdrop-blur-sm">
          <div className="bg-[#2E593F]/80 p-6 text-center" data-testid="feature-water-saving">
            <h3 className="text-xl font-semibold mb-2">Water-Saving</h3>
            <p className="text-sm text-gray-200">
              Massa tempor nec feugiat nisl. Ultrices eros in cursus turpis.
            </p>
            <div className="mt-4 flex justify-center">
              <div className="bg-[#79B42A] rounded-full p-2">
                <span className="iconify text-white" data-icon="mdi:arrow-up" data-width="24"></span>
              </div>
            </div>
          </div>
          <div className="bg-[#2E593F]/80 p-6 text-center" data-testid="feature-nutrition">
            <h3 className="text-xl font-semibold mb-2">Efficient Nutrition</h3>
            <p className="text-sm text-gray-200">
              Integer eget aliquet nibh praesent tristique magna sit amet purus.
            </p>
            <div className="mt-4 flex justify-center">
              <div className="bg-[#79B42A] rounded-full p-2">
                <span className="iconify text-white" data-icon="mdi:arrow-up" data-width="24"></span>
              </div>
            </div>
          </div>
          <div className="bg-[#2E593F]/80 p-6 text-center" data-testid="feature-quality">
            <h3 className="text-xl font-semibold mb-2">Production Quality</h3>
            <p className="text-sm text-gray-200">
              Porttitor lacus luctus accumsan tortor posuere ac malesuada fames.
            </p>
            <div className="mt-4 flex justify-center">
              <div className="bg-[#79B42A] rounded-full p-2">
                <span className="iconify text-white" data-icon="mdi:arrow-up" data-width="24"></span>
              </div>
            </div>
          </div>
          <div className="bg-[#2E593F]/80 p-6 text-center" data-testid="feature-pesticides">
            <h3 className="text-xl font-semibold mb-2">Not Use Pesticides</h3>
            <p className="text-sm text-gray-200">
              Egestas integer eget aliquet nibh praesent tristique magna sit.
            </p>
            <div className="mt-4 flex justify-center">
              <div className="bg-[#79B42A] rounded-full p-2">
                <span className="iconify text-white" data-icon="mdi:arrow-up" data-width="24"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
