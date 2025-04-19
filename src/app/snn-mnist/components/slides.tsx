import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface SlidesProps {
  children: React.ReactNode[];
}

const Slides: React.FC<SlidesProps> = ({ children }) => {
  const [current, setCurrent] = useState(0);
  const length = children.length;

  const goNext = () => {
    setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
  };

  const goPrev = () => {
    setCurrent((prev) => (prev === 0 ? length - 1 : prev - 1));
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [length]);

  if (!Array.isArray(children) || length === 0) {
    return null;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Slides container */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}vw)` }}
      >
        {children.map((slide, index) => (
          <div
            key={index}
            className="w-screen h-screen flex-shrink-0 flex items-center justify-center"
          >
            {slide}
          </div>
        ))}
      </div>

      {/* Prev arrow */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none"
        aria-label="Previous slide"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Next arrow */}
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none"
        aria-label="Next slide"
      >
        <ArrowRight size={24} />
      </button>

      {/* Slide indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 bg-opacity-50 text-white px-3 py-1 rounded">
        {current + 1} / {length}
      </div>
    </div>
  );
};

export default Slides;
