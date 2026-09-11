export default function WhoWeAre() {
  return (
    <section className="py-24 lg:py-32 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-5">
            <span className="text-xs tracking-[0.3em] uppercase text-red-500 font-semibold">Desde Valencia</span>
            <h2 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-[0.95]">
              Somos una <span className="block text-gray-500">manada.</span>
            </h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-xl lg:text-2xl text-gray-200 leading-relaxed">
              Lobos Quad Rugby es un club de rugby en silla de ruedas creado en Valencia en 2017. Desde nuestros primeros pasos hemos trabajado para convertir el deporte adaptado en una herramienta de competición, autonomía, inclusión y transformación social.
            </p>
            <p className="mt-7 text-gray-400 text-lg leading-relaxed max-w-3xl">
              Para nosotros, el rugby no termina cuando acaba un partido. Es un espacio para competir, conocer nuestros límites, superarlos y construir una comunidad en la que cada persona tenga su lugar.
            </p>
            <div className="mt-10 flex items-center gap-4 text-sm uppercase tracking-wider text-white">
              <span className="text-red-500 italic text-2xl font-black">“</span>
              <span>No necesito que sea fácil, solo que sea posible.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}