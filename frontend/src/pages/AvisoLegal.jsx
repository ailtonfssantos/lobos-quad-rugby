import { Link } from 'react-router-dom';

export default function AvisoLegal() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      
      {/* Header */}
      <section className="relative py-24 bg-zinc-900 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-zinc-950 to-zinc-950"></div>
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <p className="text-red-500 font-bold tracking-[0.2em] text-sm mb-4 uppercase">Marco Legal</p>
          <h1 className="font-display text-5xl md:text-7xl mb-6 text-white">AVISO LEGAL</h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Información legal y condiciones de uso del sitio web de Lobos Quad Rugby.
          </p>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-16 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 space-y-12">

          {/* 1. Datos identificativos */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              1. Datos identificativos
            </h2>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              En cumplimiento con el deber de información recogido en la Ley 34/2002, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilitan a continuación los siguientes datos:
            </p>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm space-y-3 text-zinc-300">
              <p><span className="text-zinc-500 font-semibold w-48 inline-block">Entidad:</span> CLUB LOBOS QUADRUGBY VALENCIA</p>
              <p><span className="text-zinc-500 font-semibold w-48 inline-block">NIF:</span> G06847578</p>
              <p><span className="text-zinc-500 font-semibold w-48 inline-block">Domicilio:</span> C/ dels Lleons, 39. C.P. 46022 Valencia, Valencia</p>
              <p><span className="text-zinc-500 font-semibold w-48 inline-block">Email:</span> lobosqr@gmail.com</p>
              <p><span className="text-zinc-500 font-semibold w-48 inline-block">Teléfono:</span> 669 474 532</p>
              <p><span className="text-zinc-500 font-semibold w-48 inline-block">Registro:</span> Nº 11094/1 (Registro de Entidades Deportivas de la Comunidad Valenciana)</p>
            </div>
          </div>

          {/* 2. Objeto */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              2. Objeto
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              El presente sitio web tiene como finalidad ofrecer información sobre las actividades, eventos y proyectos de Lobos Quad Rugby, así como facilitar el contacto con usuarios y posibles colaboradores.
            </p>
          </div>

          {/* 3. Uso del sitio web */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              3. Uso del sitio web
            </h2>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              El usuario se compromete a hacer un uso adecuado de los contenidos y servicios ofrecidos en esta web y a no emplearlos para actividades ilícitas o contrarias a la buena fe y al orden público. Al acceder y utilizar este sitio web, aceptas cumplir con estos términos y condiciones.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900/50 border border-zinc-800 p-6">
                <h3 className="text-green-500 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Uso Permitido
                </h3>
                <ul className="space-y-2 text-zinc-400 text-sm">
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">•</span> Obtener información sobre nuestros servicios</li>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">•</span> Contactar con nosotros para consultas comerciales</li>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">•</span> Solicitar presupuestos y servicios</li>
                  <li className="flex items-start gap-2"><span className="text-green-500 mt-1">•</span> Acceder a recursos y documentación pública</li>
                </ul>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-6">
                <h3 className="text-red-500 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Uso Prohibido
                </h3>
                <ul className="space-y-2 text-zinc-400 text-sm">
                  <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> Usar el sitio para actividades ilegales o fraudulentas</li>
                  <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> Intentar obtener acceso no autorizado a sistemas</li>
                  <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> Distribuir malware o código malicioso</li>
                  <li className="flex items-start gap-2"><span className="text-red-500 mt-1">•</span> Realizar ingeniería inversa de nuestros servicios</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 4. Propiedad intelectual */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              4. Propiedad intelectual
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Todos los contenidos del sitio web (textos, imágenes, logotipos, etc.) son propiedad de Lobos Quad Rugby o cuentan con las licencias necesarias para su uso, quedando prohibida su reproducción sin autorización.
            </p>
          </div>

          {/* 5. Responsabilidad */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              5. Responsabilidad
            </h2>
            <p className="text-zinc-400 mb-4 leading-relaxed">
              En ningún caso Lobos Quad Rugby será responsable de daños indirectos, incidentales, especiales o consecuenciales que resulten del uso o la imposibilidad de usar el sitio web, incluso si hemos sido advertidos de la posibilidad de tales daños.
            </p>
            <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-sm">
              <p className="text-red-400 text-sm font-semibold">Exclusiones:</p>
              <p className="text-zinc-400 text-sm mt-1">No garantizamos que el sitio web sea ininterrumpido, libre de errores o completamente seguro.</p>
            </div>
          </div>

          {/* 6. Enlaces externos */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              6. Enlaces externos
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Esta web puede contener enlaces a sitios de terceros. Lobos Quad Rugby no se responsabiliza del contenido ni de las políticas de privacidad de dichos sitios.
            </p>
          </div>

          {/* 7. Legislación aplicable */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              7. Legislación aplicable
            </h2>
            <p className="text-zinc-400 mb-4 leading-relaxed">
              La relación entre el usuario y Lobos Quad Rugby se regirá por la normativa vigente en España. Cualquier disputa será resuelta por los tribunales competentes de Madrid, España.
            </p>
            <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-3">Normativas Aplicables:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-zinc-400 text-sm">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> Código Civil y Mercantil español</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> Ley de Defensa de Consumidores y Usuarios</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> Normativa europea de comercio electrónico</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> RGPD (Reglamento General de Protección de Datos)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> LOPD-GDD (Ley Orgánica de Protección de Datos)</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span> LSSI (Ley de Servicios de la Sociedad de la Información)</li>
            </ul>
          </div>

          {/* 8. Condiciones de Servicio */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              8. Condiciones de Servicio
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              La contratación de nuestros servicios se formalizarán mediante un contrato específico.
            </p>
          </div>

          {/* Contacto Legal */}
          <div className="bg-zinc-900 border border-zinc-800 p-8 mt-12">
            <h3 className="font-display text-2xl text-white mb-6">Contacto Legal</h3>
            <p className="text-zinc-400 mb-6">Para cualquier consulta legal o relacionada con estos términos y condiciones:</p>
            <div className="space-y-3 text-zinc-300">
              <p className="font-semibold text-white">CLUB LOBOS QUADRUGBY VALENCIA</p>
              <p>📧 lobosqr@gmail.com</p>
              <p>📞 669 474 532</p>
              <p>📍 C/ dels Lleons, 39. C.P. 46022 Valencia, Valencia</p>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-zinc-800">
            <p className="text-zinc-600 text-sm uppercase tracking-widest">
              Última actualización: 27 de agosto de 2026
            </p>
          </div>

        </div>
      </section>

      {/* CTA Simples */}
      <section className="py-16 bg-zinc-900 border-t border-zinc-800 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-red-500 transition-colors font-bold uppercase tracking-widest text-sm group">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Volver al Inicio
        </Link>
      </section>

    </div>
  );
}