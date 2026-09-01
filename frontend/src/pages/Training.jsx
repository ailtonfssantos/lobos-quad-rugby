import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Training() {
  const [eventos, setEventos] = useState([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [inscricaoModal, setInscricaoModal] = useState(null);
  const [inscricaoForm, setInscricaoForm] = useState({ fullName: '', email: '', phone: '', message: '' });
  const [inscricaoSucesso, setInscricaoSucesso] = useState(false);
  const [inscricaoLoading, setInscricaoLoading] = useState(false);

    useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/eventos`);
        const data = await response.json();
        
        // ✨ FILTRO: Solo mostrar eventos activos en la web pública
        const eventosActivos = data.filter(evento => evento.isActive === true);
        
        setEventos(eventosActivos);
      } catch (error) {
        console.error('Error al cargar eventos:', error);
      } finally {
        setLoadingEventos(false);
      }
    };
    fetchEventos();
  }, []);

  const abrirInscricao = (evento) => {
    setInscricaoModal(evento);
    setInscricaoForm({ fullName: '', email: '', phone: '', message: '' });
    setInscricaoSucesso(false);
  };

  const enviarInscricao = async (e) => {
    e.preventDefault();
    setInscricaoLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inscricoes-eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...inscricaoForm,
          eventId: inscricaoModal.id
        })
      });
      if (!response.ok) throw new Error('Error en la inscripción');
      setInscricaoSucesso(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al inscribirse. Intente nuevamente.');
    } finally {
      setInscricaoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}
      <section className="relative py-24 bg-zinc-900 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-zinc-950 to-zinc-950"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-500 font-bold tracking-[0.2em] text-sm mb-4 uppercase">Entrena con Nosotros</p>
          <h1 className="font-display text-6xl md:text-8xl mb-6 text-white">ENTRENAMIENTOS</h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Descubre nuestros horarios de entrenamiento y próximos eventos especiales del club.
          </p>
        </div>
      </section>

      {/* Horários Fixos */}
      <section className="py-16 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8 hover:border-red-600/50 transition-colors group">
              <p className="text-zinc-600 text-xs uppercase tracking-widest mb-4">Ubicación</p>
              <h3 className="font-display text-2xl md:text-3xl text-white mb-2 group-hover:text-red-500 transition-colors">PABELLÓN MALVARROSA</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Av. de Neptú, s/n, 46011 Valencia, España.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-8 hover:border-red-600/50 transition-colors group">
              <p className="text-zinc-600 text-xs uppercase tracking-widest mb-4">Lunes y Miércoles</p>
              <h3 className="font-display text-3xl text-white mb-2 group-hover:text-red-500 transition-colors">17:00 - 19:30</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Sesiones semanales de alta intensidad del equipo principal.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-8 hover:border-red-600/50 transition-colors group">
              <p className="text-zinc-600 text-xs uppercase tracking-widest mb-4">Viernes</p>
              <h3 className="font-display text-3xl text-white mb-2 group-hover:text-red-500 transition-colors">10:00 - 11:30</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">Sesión matinal de entrenamiento y preparación de nuevos jugadores.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Próximos Eventos */}
      <section className="py-16 bg-zinc-900 border-y border-zinc-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-red-500 font-bold tracking-[0.2em] text-xs uppercase mb-2">Calendario</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">PRÓXIMOS EVENTOS</h2>
            <div className="w-24 h-1 bg-red-600 mx-auto"></div>
          </div>

          {loadingEventos ? (
            <div className="text-center py-12">
              <div className="inline-block w-10 h-10 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-500">Cargando eventos...</p>
            </div>
          ) : eventos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eventos.map((evento) => (
                <div key={evento.id} className="bg-zinc-950 border border-zinc-800 p-6 rounded-sm hover:border-red-600/50 transition-all duration-300 group flex flex-col">
                  <div className="flex flex-col md:flex-row gap-6 flex-grow">
                    <div className="flex-shrink-0 flex md:flex-col items-center justify-center bg-zinc-900 border border-zinc-800 rounded-sm p-4 min-w-[100px]">
                      <span className="font-display text-4xl text-red-500 leading-none">{evento.date}</span>
                      <span className="text-zinc-400 text-xs uppercase tracking-widest mt-1">{evento.month}</span>
                      <span className="text-zinc-500 text-[10px] uppercase mt-1">{evento.day}</span>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm border ${
                          evento.type === 'PUERTAS ABIERTAS' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          evento.type === 'CLINICA' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          'bg-purple-500/10 text-purple-500 border-purple-500/20'
                        }`}>{evento.type}</span>
                        <span className="text-zinc-500 text-xs flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {evento.time}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl text-white mb-2 group-hover:text-red-500 transition-colors">{evento.name}</h3>
                      <p className="text-zinc-400 text-sm mb-2 flex items-start gap-2">
                        <svg className="w-4 h-4 mt-0.5 text-zinc-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {evento.location}
                      </p>
                      {evento.description && (
                        <p className="text-zinc-500 text-sm leading-relaxed">{evento.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Botão de Inscrição (SÓ para eventos públicos) */}
                  {evento.isPublic && (
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <button
                        onClick={() => abrirInscricao(evento)}
                        className="w-full py-3 bg-red-600 text-white font-bold uppercase tracking-widest text-sm hover:bg-red-700 transition-colors rounded-sm"
                      >
                        Inscribirme al Evento
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-950 border border-zinc-800 p-12 text-center rounded-sm">
              <svg className="w-12 h-12 text-zinc-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="text-zinc-500 text-lg">No hay eventos próximos programados.</p>
              <p className="text-zinc-600 text-sm mt-2">Consulta nuestros horarios de entrenamiento habituales.</p>
            </div>
          )}
        </div>
      </section>

      {/* Mapa */}
      <section className="py-16 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-red-500 font-bold tracking-[0.2em] text-xs uppercase mb-2">Encuéntranos</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">NUESTRA UBICACIÓN</h2>
            <div className="w-24 h-1 bg-red-600 mx-auto"></div>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 overflow-hidden rounded-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3079.3920446386073!2d-0.32886762490259597!3d39.48306121193713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6048770f04218d%3A0xd97df836238c0cd7!2sPabell%C3%B3n%20Malvarrosa!5e0!3m2!1ses!2ses!4v1788012711007!5m2!1ses!2ses"
              width="100%"
              height="450"
              style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2)' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Ubicación Pabellón Malvarrosa"
            ></iframe>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-red-600 relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-6xl mb-6 text-white">¿LISTO PARA ENTRENAR?</h2>
          <p className="text-xl mb-10 text-red-100 font-light">Únete a la manada y descubre el rugby en silla de ruedas.</p>
          <Link to="/unete" className="inline-block px-10 py-5 bg-zinc-950 text-white font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-2xl">
            Quiero Unirme
          </Link>
        </div>
      </section>

      {/* MODAL DE INSCRIÇÃO EM EVENTO */}
      {inscricaoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setInscricaoModal(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-sm max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl text-white">Inscribirme</h2>
                <p className="text-zinc-500 text-sm mt-1">{inscricaoModal.name}</p>
              </div>
              <button onClick={() => setInscricaoModal(null)} className="text-zinc-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {inscricaoSucesso ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="font-display text-2xl text-white mb-2">¡Inscripción Exitosa!</h3>
                <p className="text-zinc-400 mb-6">Te esperamos en el evento. Recibirás más información por email.</p>
                <button onClick={() => setInscricaoModal(null)} className="px-6 py-3 bg-zinc-800 text-white font-bold uppercase tracking-widest text-sm hover:bg-zinc-700 transition-colors rounded-sm">
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={enviarInscricao} className="p-6 space-y-4">
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Nombre Completo *</label>
                  <input type="text" value={inscricaoForm.fullName} onChange={(e) => setInscricaoForm({...inscricaoForm, fullName: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors rounded-sm" />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Email *</label>
                  <input type="email" value={inscricaoForm.email} onChange={(e) => setInscricaoForm({...inscricaoForm, email: e.target.value})} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors rounded-sm" />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Teléfono</label>
                  <input type="tel" value={inscricaoForm.phone} onChange={(e) => setInscricaoForm({...inscricaoForm, phone: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors rounded-sm" />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Mensaje (opcional)</label>
                  <textarea value={inscricaoForm.message} onChange={(e) => setInscricaoForm({...inscricaoForm, message: e.target.value})} rows={3} placeholder="¿Tienes alguna pregunta o necesidad especial?" className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors rounded-sm resize-none" />
                </div>
                <button type="submit" disabled={inscricaoLoading} className="w-full py-3 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors rounded-sm disabled:opacity-50">
                  {inscricaoLoading ? 'Enviando...' : 'Confirmar Inscripción'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}