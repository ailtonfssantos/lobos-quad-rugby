import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from '../../components/Icons'; // Ajuste o caminho se necessário

export default function Hero() {
  return (
    <section className="relative min-h-[78vh] flex items-end overflow-hidden">
      <div className="absolute inset-0">
        <img src="/assets/equipo1.JPG" alt="Lobos Quad Rugby Valencia" className="w-full h-full object-cover grayscale opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      </div>
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 pb-16 lg:pb-24">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-px bg-red-600" />
            <span className="text-xs tracking-[0.3em] uppercase text-gray-300">Quiénes somos</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[0.9] uppercase">
            Lobos <span className="block text-gray-400">Quad Rugby</span>
          </h1>
          <p className="mt-8 text-lg sm:text-xl lg:text-2xl text-gray-200 max-w-2xl leading-relaxed">
            Un club de rugby en silla de ruedas nacido en Valencia para competir, crecer y abrir camino.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/equipo" className="group inline-flex items-center gap-3 bg-white text-black px-6 py-4 text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:bg-red-600 hover:text-white">
              Conoce al equipo <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
            <Link to="/competiciones" className="inline-flex items-center gap-3 border border-white/30 px-6 py-4 text-sm font-bold uppercase tracking-wide text-white hover:border-white hover:bg-white/10 transition-all duration-300">
              Ver competiciones <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}