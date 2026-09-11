// frontend/src/pages/About/Gallery.jsx
import { useState, useEffect } from 'react';

const galleryImages = [
  '/assets/momento-1.PNG', '/assets/momento-2.PNG', '/assets/momento-3.PNG',
  '/assets/momento-4.PNG', '/assets/momento-5.PNG', '/assets/momento-6.PNG', '/assets/momento-7.PNG',
];

export default function Gallery() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % galleryImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % galleryImages.length);
  const previousImage = () => setCurrentImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  return (
    <section className="py-24 lg:py-32 bg-[#080808] border-y border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* ... (cole aqui o cabeçalho da galeria e os botões) ... */}
        
        <div className="relative aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-black">
          {galleryImages.map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`Lobos Quad Rugby - momento ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${index === currentImage ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          {/* ... (cole aqui os indicadores e rodapé da galeria) ... */}
        </div>
      </div>
    </section>
  );
}