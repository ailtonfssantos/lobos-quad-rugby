import { Link } from 'react-router-dom';

export default function PoliticaCookies() {
  const tiposCookies = [
    {
      title: 'Cookies Técnicas',
      desc: 'Necesarias para el funcionamiento básico y la navegación de la web.',
    },
    {
      title: 'Cookies de Personalización',
      desc: 'Permiten recordar preferencias del usuario para una experiencia a medida.',
    },
    {
      title: 'Cookies de Análisis',
      desc: 'Ayudan a entender cómo interactúan los usuarios con la web para mejorar el servicio.',
    },
  ];

  const navegadores = [
    { name: 'Google Chrome', url: 'https://support.google.com/chrome/answer/95647' },
    { name: 'Mozilla Firefox', url: 'https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias' },
    { name: 'Safari', url: 'https://support.apple.com/es-es/guide/safari/sfri11471/mac' },
    { name: 'Microsoft Edge', url: 'https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      
      {/* Header */}
      <section className="relative py-24 bg-zinc-900 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-zinc-950 to-zinc-950"></div>
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <p className="text-red-500 font-bold tracking-[0.2em] text-sm mb-4 uppercase">Privacidad y Datos</p>
          <h1 className="font-display text-5xl md:text-7xl mb-6 text-white">POLÍTICA DE COOKIES</h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Información sobre el uso de cookies en este sitio web.
          </p>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-16 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 space-y-12">

          {/* 1. ¿Qué son las cookies? */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              1. ¿Qué son las cookies?
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas una página web. Sirven para recordar información sobre tu visita y mejorar la experiencia del usuario.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              En <span className="text-white font-semibold">Lobos Quad Rugby</span>, utilizamos cookies de manera responsable y transparente, siempre respetando tu privacidad y cumpliendo con la normativa europea de protección de datos.
            </p>
          </div>

          {/* 2. Tipos de cookies utilizadas */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              2. Tipos de cookies utilizadas
            </h2>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              Este sitio web puede utilizar las siguientes categorías de cookies:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tiposCookies.map((cookie, index) => (
                <div key={index} className="bg-zinc-900 border border-zinc-800 p-6 hover:border-red-600/50 transition-colors">
                  <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                    {cookie.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{cookie.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Cookies de terceros */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              3. Cookies de terceros
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Este sitio web puede utilizar servicios de terceros como redes sociales o herramientas de análisis que instalan sus propias cookies, sujetas a sus respectivas políticas de privacidad.
            </p>
          </div>

          {/* 4. Cómo desactivar las cookies */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              4. Cómo desactivar las cookies
            </h2>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              Puedes permitir, bloquear o eliminar las cookies instaladas en tu dispositivo mediante la configuración de tu navegador:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {navegadores.map((nav, index) => (
                <a 
                  key={index}
                  href={nav.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-sm hover:bg-zinc-800 hover:border-red-600/50 transition-all group"
                >
                  <span className="text-red-500 group-hover:translate-x-1 transition-transform">→</span>
                  <span className="text-zinc-300 text-sm font-medium">{nav.name}</span>
                </a>
              ))}
            </div>

            <div className="bg-zinc-900/50 border border-zinc-700 p-6 rounded-sm">
              <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Impacto de Deshabilitar Cookies
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Si deshabilitas estas cookies, algunas funciones del sitio web pueden no funcionar correctamente, como el formulario de contacto o la navegación entre páginas. No podremos analizar cómo mejoras tu experiencia de usuario ni identificar problemas de rendimiento. Deshabilitar estas cookies significa que no recordaremos tus preferencias de interfaz y tendrás que configurarlas en cada visita.
              </p>
            </div>
          </div>

          {/* 5. Aceptación */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              5. Aceptación de la política de cookies
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Al navegar por este sitio web, el usuario acepta el uso de cookies en las condiciones establecidas en la presente política.
            </p>
          </div>

          {/* 6. Modificaciones */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              6. Modificaciones
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Lobos Quad Rugby puede modificar esta política de cookies en función de exigencias legislativas o con la finalidad de adaptarla a nuevas funcionalidades del sitio web.
            </p>
          </div>

          {/* Contacto */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 mt-12">
            <h3 className="font-display text-2xl text-white mb-6">Contacto</h3>
            <p className="text-zinc-400 mb-6">Para cualquier consulta sobre nuestra política de cookies, puedes contactarnos:</p>
            <div className="space-y-3 text-zinc-300">
              <p className="font-semibold text-white">CLUB LOBOS QUADRUGBY VALENCIA</p>
              <p>📧 <a href="mailto:lobosqr@gmail.com" className="hover:text-red-500 transition-colors">lobosqr@gmail.com</a></p>
              <p>📞 669 474 532</p>
              <p>📍 C/ dels Lleons, 39. C.P. 46022 Valencia, Valencia</p>
            </div>
          </div>

          {/* Footer da Página */}
          <div className="text-center pt-12 border-t border-zinc-800 mt-12">
            <p className="text-zinc-600 text-sm uppercase tracking-widest mb-8">
              Última actualización: 27 de agosto de 2026
            </p>
            <Link to="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-red-500 transition-colors font-bold uppercase tracking-widest text-sm group">
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Volver al Inicio
            </Link>
          </div>

        </div>
      </section>
    </div>
  );
}