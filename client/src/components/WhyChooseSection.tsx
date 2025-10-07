export default function WhyChooseSection() {
  return (
    <section className="bg-[#EFF6EF] py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-[#79B42A] font-semibold mb-2">WHY CHOOSE US</p>
          <h2 className="text-4xl font-bold text-[#2E593F] mb-4">Benefits of Hydroponic Farming</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center" data-testid="benefit-water">
            <div className="w-20 h-20 bg-[#79B42A] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="iconify text-white" data-icon="mdi:water" data-width="40"></span>
            </div>
            <h3 className="text-xl font-bold text-[#2E593F] mb-2">90% Less Water</h3>
            <p className="text-gray-600">Hydroponic systems use significantly less water than traditional farming.</p>
          </div>

          <div className="text-center" data-testid="benefit-yields">
            <div className="w-20 h-20 bg-[#79B42A] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="iconify text-white" data-icon="mdi:chart-line" data-width="40"></span>
            </div>
            <h3 className="text-xl font-bold text-[#2E593F] mb-2">Higher Yields</h3>
            <p className="text-gray-600">Produce 3-10 times more crops in the same space compared to soil.</p>
          </div>

          <div className="text-center" data-testid="benefit-growth">
            <div className="w-20 h-20 bg-[#79B42A] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="iconify text-white" data-icon="mdi:clock-fast" data-width="40"></span>
            </div>
            <h3 className="text-xl font-bold text-[#2E593F] mb-2">Faster Growth</h3>
            <p className="text-gray-600">Plants grow 30-50% faster with optimized nutrient delivery.</p>
          </div>

          <div className="text-center" data-testid="benefit-year-round">
            <div className="w-20 h-20 bg-[#79B42A] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="iconify text-white" data-icon="mdi:calendar-check" data-width="40"></span>
            </div>
            <h3 className="text-xl font-bold text-[#2E593F] mb-2">Year-Round</h3>
            <p className="text-gray-600">Grow fresh produce all year regardless of weather conditions.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
