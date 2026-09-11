import { useState, useEffect } from 'react';

const galleryImages = [
  '/assets/momento-1.PNG', '/assets/momento-2.PNG', '/assets/momento-3.PNG',
  '/assets/momento-4.PNG', '/assets/momento-5.PNG', '/assets/momento-6.PNG', '/assets/momento-7.PNG',
];

export default function Gallery() {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % galleryImages.length);
  const previousImage = () => setCurrentImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % galleryImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 lg:py-32 bg-[#080808] border-y border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-12">
          <div>
            <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">Dentro de la pista</span>
            <h2 className="mt-4 text-4xl sm:text-5xl font-black uppercase">La manada en acción</h2>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={previousImage} aria-label="Imagen anterior" className="w-12 h-12 border border-white/20 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all">
              <span className="text-xl">←</span>
            </button>
            <button type="button" onClick={nextImage} aria-label="Siguiente imagen" className="w-12 h-12 border border-white/20 flex items-center justify-center hover:border-white hover:bg-white/10 transition-all">
              <span className="text-xl">→</span>
            </button>
          </div>
        </div>

        <div className="relative aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-black">
          {galleryImages.map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`Lobos Quad Rugby - momento ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${index === currentImage ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-white/70">Lobos Quad Rugby · Valencia</span>
            <span className="text-xs font-mono text-white/70">{String(currentImage + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          {galleryImages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentImage(index)}
              aria-label={`Ver imagen ${index + 1}`}
              className={`h-1 transition-all duration-300 ${index === currentImage ? 'w-10 bg-red-600' : 'w-5 bg-white/20 hover:bg-white/40'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}