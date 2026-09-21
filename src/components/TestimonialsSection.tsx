import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TestimonialItem {
  id: string;
  author: string;
  outlet: string;
  quote: string;
}

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'hellan-white',
    author: 'Hellan White',
    outlet: 'The Mayflower - Poes garden',
    quote:
      'Absolutely excellent. The music, combined with the pleasant atmosphere, made us feel relaxed. The service was swift, so we didn’t have to wait too long after ordering our menu. The service was courteous and helpful, and the meal was excellent. I strongly recommend that you sample the Italian dessert panna cotta, which was delicious due to its smooth, creamy texture.'
  },
  {
    id: 'street-smart',
    author: 'Street Smart',
    outlet: 'The Mayflower: Palavakam',
    quote:
      'It’s very easy to locate this place and it’s very close to one of the Palavakkam beach roads. There isn’t dedicated parking and you have to leave the car on the road. We tried their tomato soup, garlic bread and dumplings. Food was above avg. Best part about this place is that they have very good outdoor seating.'
  },
  {
    id: 'aaryan-anand',
    author: 'Aaryan V Anand',
    outlet: 'The Mayflower: Palavakam',
    quote:
      'I’ve been wanting to write this review for so long, and finally here we are: Mayflower, a restaurant near the beach. It doesn’t offer any beach views, but that does not make this place any less special. The ambience is spectacular; you really can come in here and feel the comfort of having lunch with your family and catching up with your friends during dinner. The menu offers multi-cuisines in Italian,Chinese, Korean, and occasional burgers. Each main course item can definitely fill you up. A favourite is the orange chicken, and this is my mother’s favourite, so definitely more authentic than anything I can say. A few favourites I recommend are the Korean Burger and Chicken, The pizzas and momos are on point, and when it comes to deserts, do not leave without having a gelato. Parking is slightly tough to find during peak hours but its a neighbourhood where u can find plenty'
  },
  {
    id: 'priya-sundaram',
    author: 'Priya Sundaram',
    outlet: 'The Mayflower: Anna Nagar',
    quote:
      'A botanical paradise in the heart of Anna Nagar. The glasshouse aesthetic, filtered natural light, and tranquil greenery make it our top pick for weekend brunches. Their sourdough avocado toast and specialty pour-over coffee are second to none. Impeccable hospitality every single visit.'
  },
  {
    id: 'karthik-raja',
    author: 'Karthik Raja',
    outlet: 'The Mayflower: Egmore',
    quote:
      'Stepping into Mayflower Egmore feels like entering a calm sanctuary right in central Chennai. The colonial-inspired architecture blends beautifully with the modern botanical vibe. Loved the wild mushroom risotto and the artisanal tiramisu. Truly a refined dining experience.'
  },
  {
    id: 'divya-nambiar',
    author: 'Divya Nambiar',
    outlet: 'The Mayflower: Poes garden',
    quote:
      'Mayflower Poes Garden holds a special place for our celebrations. The attention to detail, from the ambient acoustics to the bespoke table service, is remarkable. The lotus stem crisps and truffle pasta were sublime. A must-visit culinary sanctuary in Chennai.'
  }
];

export const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = TESTIMONIALS.length;

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  // Auto-scroll every 7 seconds, pauses on hover
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section
      id="testimonials"
      className="py-16 sm:py-24 bg-[#FAF7F2] text-[#1A1A1A] relative border-b border-[#E8E4DB] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Visitor Testimonials"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header Matching Reference */}
        <div className="text-center mb-6 sm:mb-8">
          <span className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-[#5A6B47] block mb-1 font-normal tracking-wide">
            Testimonials
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1A1A1A]">
            From our Visitors
          </h2>
        </div>

        {/* Central Circular Mayflower Logo Emblem */}
        <div className="flex justify-center mb-8 sm:mb-10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white flex items-center justify-center p-3 shadow-md border border-stone-100 transition-transform duration-300 hover:scale-105">
            <img
              src="/mayflower-logo-badge.png"
              alt="The Mayflower"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Carousel Container with Left/Right Arrows */}
        <div className="relative max-w-4xl mx-auto px-10 sm:px-16">
          
          {/* Previous Arrow Button */}
          <button
            onClick={prevSlide}
            className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 p-2 text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5]" />
          </button>

          {/* Testimonial Content */}
          <div className="text-center min-h-[160px] sm:min-h-[140px] flex flex-col items-center justify-center transition-all duration-300">
            <p className="text-sm sm:text-[15px] md:text-base text-[#2C2C2C] leading-relaxed max-w-3xl mx-auto font-normal">
              {current.quote}
            </p>

            <p className="mt-6 text-sm sm:text-[15px] text-[#1A1A1A]">
              <span className="font-bold">{current.author}</span>{' '}
              <span className="text-stone-500 font-normal">- {current.outlet}</span>
            </p>
          </div>

          {/* Next Arrow Button */}
          <button
            onClick={nextSlide}
            className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 p-2 text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5]" />
          </button>
        </div>

        {/* Bottom Pagination Dots */}
        <div className="flex items-center justify-center gap-2.5 mt-8 sm:mt-10">
          {TESTIMONIALS.map((t, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={t.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#1A1A1A] scale-110'
                    : 'border border-stone-400 bg-transparent hover:bg-stone-300'
                }`}
                aria-label={`Go to testimonial ${idx + 1} of ${total}`}
                aria-current={isActive ? 'true' : 'false'}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
};
