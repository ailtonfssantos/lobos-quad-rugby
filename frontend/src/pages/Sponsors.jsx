import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Sponsors() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    sponsorshipType: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await fetch('http://localhost:4000/api/patrocinadores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar solicitação');
    }

    const data = await response.json();
    console.log('Patrocínio salvo:', data);
    
    setSubmitted(true);
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao enviar solicitação. Tente novamente.');
  }
};

  // 1. Patrocinadores Atuais (com links)
  const currentSponsors = [
    { 
      name: 'Rodem', 
      description: 'Ortopedia y Movilidad', 
      logo: '/assets/rodem.png', 
      url: 'https://rodem.es/' 
    },
    { 
      name: 'RK Inmocarrillo', 
      description: 'Colaborador Oficial', 
      logo: '/assets/inmocarrillo.png', 
      url: 'https://www.inmocarrillo.com/' 
    },
  ];

  // 2. Administrações Colaboradoras (com links)
  const administraciones = [
    { 
      name: 'FESA', 
      url: 'https://www.fesa.es/', 
      logo: '/assets/fesa.png' 
    },
    { 
      name: 'Fundación Deporte Municipal', 
      url: 'https://www.fdmvalencia.es/es/', 
      logo: '/assets/fundacion.png' 
    },
    { 
      name: 'Generalitat Valenciana', 
      url: 'https://www.gva.es/es/', 
      logo: '/assets/generalitat.png' 
    },
  ];

  const modalidades = [
    {
      name: 'Platinum', price: '6.000€', max: 'Máximo 1 patrocinador', color: 'from-zinc-700 to-zinc-900', borderColor: 'border-zinc-600',
      benefits: ['Exclusividad sectorial', 'Patrocinador principal en la jornada de liga organizada en Valencia', 'La marca pone su nombre a la jornada Liga Valencia', 'Logo destacado en el cartel jornada Liga Valencia', 'Logo en retransmisión partidos jornada Liga Valencia', 'Bandera con logo exclusivo en jornada Liga Valencia*', 'Logo en sillas de ruedas (respaldo)', 'Logo en vídeo promocional del equipo', 'Organización de jornada para trabajadores', 'Publicidad y agradecimiento en redes sociales'],
    },
    {
      name: 'Gold', price: '3.000€', max: 'Máximo 2 patrocinadores', color: 'from-yellow-700/20 to-zinc-900', borderColor: 'border-yellow-700',
      benefits: ['Exclusividad sectorial del patrocinador', 'Logo en sillas de ruedas (ruedas)', 'Logo en el cartel jornada Liga Valencia', 'Logo en retransmisión partidos jornada Liga Valencia', 'Logo en vídeo promocional del equipo', 'Organización de jornada de sensibilización para trabajadores', 'Publicidad y agradecimiento en redes sociales'],
    },
    {
      name: 'Silver', price: '1.500€', max: 'Máximo 5 patrocinadores', color: 'from-zinc-600/20 to-zinc-900', borderColor: 'border-zinc-500',
      benefits: ['Logo en el cartel jornada Liga Valencia', 'Logo en retransmisión partidos jornada Liga Valencia', 'Logo en vídeo promocional del equipo', 'Organización de jornada de sensibilización para trabajadores', 'Publicidad y agradecimiento en redes sociales'],
    },
    {
      name: 'Colabora', price: '500€', max: 'Sin límite', color: 'from-red-900/20 to-zinc-900', borderColor: 'border-red-700',
      benefits: ['Organización de jornada de sensibilización para trabajadores', 'Publicidad y agradecimiento en redes sociales'],
    },
  ];

  const comparativa = [
    { feature: 'Precio (sin IVA incluido)', platinum: '6.000€', gold: '3.000€', silver: '1.500€', colabora: '500€' },
    { feature: 'Exclusividad sectorial', platinum: true, gold: true, silver: false, colabora: false },
    { feature: 'Patrocinador principal jornada Liga Valencia', platinum: true, gold: false, silver: false, colabora: false },
    { feature: 'La marca pone su nombre a la jornada', platinum: true, gold: false, silver: false, colabora: false },
    { feature: 'Logo en ruedas', platinum: true, gold: true, silver: false, colabora: false },
    { feature: 'Logo en cartelería jornada Liga Valencia', platinum: true, gold: true, silver: true, colabora: false },
    { feature: 'Logo en retransmisión partidos', platinum: true, gold: true, silver: true, colabora: false },
    { feature: 'Bandera con logo exclusivo', platinum: true, gold: false, silver: false, colabora: false },
    { feature: 'Logo en respaldo', platinum: true, gold: false, silver: false, colabora: false },
    { feature: 'Logo en vídeo promocional equipo', platinum: true, gold: true, silver: true, colabora: false },
    { feature: 'Jornada para trabajadores', platinum: true, gold: true, silver: true, colabora: true },
    { feature: 'Publicidad y agradecimientos en redes', platinum: true, gold: true, silver: true, colabora: true },
  ];

  // Dados de Transparência
  const subvenciones = [
    {
      year: '2025',
      amount: '6.960,26€',
      entidad: 'Ayuntamiento de Valencia',
      administracion: 'Local',
      departamento: 'Servicio de Deportes',
      fecha: '12/12/2025',
      convocatoria: 'Acord de JGL de 12/12/2025 Concessió subvenciones a projectes esportius a la ciutat de València temporada 2024-2025',
      link: '#' // Adicionei um placeholder para evitar erro, substitua pelo link real se tiver
    },
    {
      year: '2025',
      amount: '6.500,00€',
      entidad: 'Ayuntamiento de Valencia',
      administracion: 'Local',
      departamento: 'Valencia',
      fecha: '25/03/2025',
      convocatoria: 'Convocatoria subvenciones en régimen de concurrencia competitiva a proyectos deportivos presentados por entidades sin ánimo de lucro para la temporada 2023-2024.',
      link: 'https://sede.valencia.es/sede/ordenanzas/index.xhtml'
    },
    {
      year: '2023',
      amount: '4.332,83€',
      entidad: 'Secretaría Autonómica de Cultura y Deporte',
      administracion: 'Autonómica',
      departamento: 'Comunitat Valenciana',
      fecha: '01/08/2023',
      convocatoria: 'Resolución de 27 de febrero de 2023, de la consellera de Educación Cultura y Deporte, de bases y convocatoria de subvenciones destinadas a la adquisición de material inmovilizado para la promoción del deporte adaptado para la ejecución del PRTR.',
      link: 'https://dogv.gva.es/datos/2023/03/02/pdf/2023_2120.pdf'
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="inline-block mb-8">
            <div className="w-24 h-24 border-2 border-red-600 flex items-center justify-center mx-auto">
              <span className="text-red-500 text-5xl font-display">✓</span>
            </div>
          </div>
          <h1 className="font-display text-5xl md:text-6xl mb-6">SOLICITUD ENVIADA</h1>
          <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Gracias por tu interés en colaborar con Lobos Quad Rugby. Nuestro equipo se pondrá en contacto contigo en las próximas 48 horas.
          </p>
          <Link to="/" className="inline-block px-8 py-4 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      
      {/* Header */}
      <section className="relative py-24 bg-zinc-900 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-zinc-950 to-zinc-950"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-500 font-bold tracking-[0.2em] text-sm mb-4 uppercase">Hazte</p>
          <h1 className="font-display text-6xl md:text-8xl mb-6 text-white">PATROCINADORES</h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Gana visibilidad apoyando el deporte inclusivo. Patrocina a Lobos Quad Rugby y posiciona tu marca en eventos deportivos y acciones sociales.
          </p>
        </div>
      </section>

      {/* Nuestros Patrocinadores (AGORA CLICÁVEL) */}
      <section className="py-16 bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-red-500 font-bold tracking-[0.2em] text-xs uppercase mb-2">Confían en nosotros</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">NUESTROS PATROCINADORES</h2>
            <p className="text-zinc-400 text-lg">Promoviendo el deporte inclusivo y la superación personal desde 2015.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {currentSponsors.map((sponsor) => (
              <a 
                key={sponsor.name} 
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-zinc-900 border border-zinc-800 p-8 flex flex-col items-center justify-center hover:border-red-600/50 transition-all duration-300 group block"
              >
                <div className="w-full h-40 flex items-center justify-center mb-6 bg-zinc-950/50 rounded-sm overflow-hidden">
                  <img src={sponsor.logo} alt={sponsor.name} className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <h3 className="font-display text-2xl text-white mb-1 group-hover:text-red-500 transition-colors">{sponsor.name}</h3>
                <p className="text-zinc-500 text-sm uppercase tracking-widest">{sponsor.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Modalidades de Patrocinio */}
      <section className="py-16 bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-red-500 font-bold tracking-[0.2em] text-xs uppercase mb-2">Elige tu nivel</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">MODALIDADES DE PATROCINIO</h2>
            <div className="w-24 h-1 bg-red-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modalidades.map((mod) => (
              <div key={mod.name} className={`bg-gradient-to-br ${mod.color} border ${mod.borderColor} p-8 hover:scale-105 transition-all duration-300 relative overflow-hidden flex flex-col`}>
                <h3 className="font-display text-4xl text-white mb-2">{mod.name}</h3>
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-zinc-950/80 backdrop-blur border border-zinc-700 text-zinc-400 text-[10px] uppercase tracking-wider">{mod.max}</span>
                </div>
                <div className="mb-8 pb-6 border-b border-zinc-700/50">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl text-white">{mod.price}</span>
                    <span className="text-zinc-400 text-sm">+ IVA</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-grow">
                  {mod.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="text-red-500 mt-0.5 font-bold">✓</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <a href="#formulario" className={`mt-8 block w-full py-3 bg-zinc-950 border ${mod.borderColor} text-white font-bold uppercase tracking-widest text-sm hover:bg-red-600 hover:border-red-600 transition-all text-center`}>
                  Contactar
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabela Comparativa */}
      <section className="py-16 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-red-500 font-bold tracking-[0.2em] text-xs uppercase mb-2">Detalles</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">COMPARATIVA</h2>
            <div className="w-24 h-1 bg-red-600 mx-auto"></div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800">
                  <th className="p-4 text-left text-zinc-400 text-xs uppercase tracking-widest font-bold">Característica</th>
                  <th className="p-4 text-center text-zinc-400 text-xs uppercase tracking-widest font-bold">Platinum</th>
                  <th className="p-4 text-center text-zinc-400 text-xs uppercase tracking-widest font-bold">Gold</th>
                  <th className="p-4 text-center text-zinc-400 text-xs uppercase tracking-widest font-bold">Silver</th>
                  <th className="p-4 text-center text-zinc-400 text-xs uppercase tracking-widest font-bold">Colabora</th>
                </tr>
              </thead>
              <tbody>
                {comparativa.map((row, index) => (
                  <tr key={index} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 text-zinc-300 text-sm">{row.feature}</td>
                    <td className="p-4 text-center">{typeof row.platinum === 'boolean' ? (row.platinum ? <span className="text-red-500 text-xl">✓</span> : <span className="text-zinc-700">—</span>) : <span className="text-white font-bold">{row.platinum}</span>}</td>
                    <td className="p-4 text-center">{typeof row.gold === 'boolean' ? (row.gold ? <span className="text-red-500 text-xl">✓</span> : <span className="text-zinc-700">—</span>) : <span className="text-white font-bold">{row.gold}</span>}</td>
                    <td className="p-4 text-center">{typeof row.silver === 'boolean' ? (row.silver ? <span className="text-red-500 text-xl">✓</span> : <span className="text-zinc-700">—</span>) : <span className="text-white font-bold">{row.silver}</span>}</td>
                    <td className="p-4 text-center">{typeof row.colabora === 'boolean' ? (row.colabora ? <span className="text-red-500 text-xl">✓</span> : <span className="text-zinc-700">—</span>) : <span className="text-white font-bold">{row.colabora}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* NOVA SEÇÃO: TRANSPARÊNCIA E SUBVENÇÕES     */}
      {/* ========================================== */}
      <section className="py-16 bg-zinc-900 border-y border-zinc-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-red-500 font-bold tracking-[0.2em] text-xs uppercase mb-2">Nuestro Compromiso</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">TRANSPARENCIA</h2>
            <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
            <p className="text-zinc-400 text-lg max-w-3xl mx-auto leading-relaxed">
              Apostamos por un deporte inclusivo, competitivo y transparente. Estas ayudas se traducen directamente en más oportunidades, competición y desarrollo para nuestros jugadores.
            </p>
          </div>

          {/* Cards de Impacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-zinc-950 border border-zinc-800 p-8 text-center hover:border-red-600/50 transition-colors">
              <span className="block text-zinc-500 text-xs uppercase tracking-widest mb-2">Total Ayudas 2025</span>
              <span className="block font-display text-5xl text-white mb-2">13.460,26€</span>
              <span className="inline-block px-3 py-1 bg-red-900/30 text-red-500 border border-red-900 text-xs font-bold uppercase tracking-wider">2 Subvenciones</span>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-8 text-center hover:border-red-600/50 transition-colors">
              <span className="block text-zinc-500 text-xs uppercase tracking-widest mb-2">Total Ayudas 2023</span>
              <span className="block font-display text-5xl text-white mb-2">4.332,83€</span>
              <span className="inline-block px-3 py-1 bg-zinc-800 text-zinc-400 border border-zinc-700 text-xs font-bold uppercase tracking-wider">1 Subvención</span>
            </div>
          </div>

          <p className="text-zinc-400 text-center mb-12 max-w-3xl mx-auto">
            Estas ayudas permiten financiar desplazamientos, material deportivo y la participación en competiciones oficiales.
          </p>

          {/* Lista Detalhada de Subvenções */}
          <div className="mb-16">
            <h3 className="font-display text-2xl text-white mb-8 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-red-600"></span>
              Subvenciones Recibidas
            </h3>
            <p className="text-zinc-500 text-sm mb-6 italic">
              Información suministrada por los órganos y entidades de las Administraciones Públicas a la Base de Datos Nacional de Subvenciones.
            </p>

            <div className="space-y-6">
              {subvenciones.map((sub, index) => (
                <div key={index} className="bg-zinc-950 border border-zinc-800 p-6 md:p-8 hover:border-zinc-700 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-display text-3xl text-red-500">{sub.year}</span>
                        <span className="font-display text-3xl text-white">{sub.amount}</span>
                      </div>
                      <h4 className="text-white font-bold text-lg">{sub.entidad}</h4>
                    </div>
                    <div className="text-right md:text-right">
                      <p className="text-zinc-500 text-xs uppercase tracking-wider">Fecha de concesión</p>
                      <p className="text-zinc-300 font-medium">{sub.fecha}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-zinc-600 text-xs uppercase tracking-wider block mb-1">Administración</span>
                      <span className="text-zinc-300">{sub.administracion}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 text-xs uppercase tracking-wider block mb-1">Departamento</span>
                      <span className="text-zinc-300">{sub.departamento}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="text-zinc-600 text-xs uppercase tracking-wider block mb-1">Convocatoria</span>
                    <p className="text-zinc-400 text-sm leading-relaxed">{sub.convocatoria}</p>
                  </div>

                  {sub.link && sub.link !== '#' && (
                    <a 
                      href={sub.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 text-sm font-bold uppercase tracking-wider transition-colors group"
                    >
                      Ver bases reguladoras (BBRR)
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Administraciones Colaboradoras (AGORA CLICÁVEL E DINÂMICO) */}
          <div className="text-center">
            <h3 className="font-display text-2xl text-white mb-8">Administraciones Colaboradoras</h3>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {administraciones.map((admin) => (
                <a
                  key={admin.name}
                  href={admin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                  title={`Visitar sitio web de ${admin.name}`}
                >
                  <img 
                    src={admin.logo} 
                    alt={admin.name} 
                    className="h-16 md:h-20 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-500 hover:scale-105"
                  />
                </a>
              ))}
            </div>
            <p className="text-zinc-500 text-sm mt-8 max-w-2xl mx-auto leading-relaxed">
              Trabajamos cada día para garantizar una gestión clara, accesible y responsable, reforzando la confianza de nuestros colaboradores y la comunidad.
            </p>
          </div>
        </div>
      </section>
      {/* ========================================== */}
      {/* FIM DA SEÇÃO DE TRANSPARÊNCIA              */}
      {/* ========================================== */}

      {/* Formulário de Contato */}
      <section id="formulario" className="py-16 bg-zinc-950">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-red-500 font-bold tracking-[0.2em] text-xs uppercase mb-2">Contacto</p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-4">COLABORA CON NOSOTROS</h2>
            <p className="text-zinc-400 text-lg">
              Cuéntanos qué tipo de colaboración te interesa y nos pondremos en contacto contigo lo antes posible.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Nombre de la Empresa *</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Nombre del Contacto *</label>
                <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors" />
              </div>
              <div>
                <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Teléfono</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Tipo de Patrocinio *</label>
              <select name="sponsorshipType" value={formData.sponsorshipType} onChange={handleChange} required className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors">
                <option value="">Selecciona una modalidad</option>
                <option value="Platinum">Platinum - 6.000€</option>
                <option value="Gold">Gold - 3.000€</option>
                <option value="Silver">Silver - 1.500€</option>
                <option value="Colabora">Colabora - 500€</option>
                <option value="Otro">Otro tipo de colaboración</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">Mensaje</label>
              <textarea name="message" value={formData.message} onChange={handleChange} rows={5} className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors resize-none" placeholder="Cuéntanos más sobre tu interés en colaborar..."></textarea>
            </div>

            <button type="submit" className="w-full py-4 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors">
              Enviar Solicitud
            </button>
          </form>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-red-600 relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-6xl mb-6 text-white">¿LISTO PARA FORMAR PARTE?</h2>
          <p className="text-xl mb-10 text-red-100 font-light">Únete a nuestra manada de patrocinadores y marca la diferencia.</p>
          <a href="#formulario" className="inline-block px-10 py-5 bg-zinc-950 text-white font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-2xl">
            Contactar Ahora
          </a>
        </div>
      </section>

    </div>
  );
}