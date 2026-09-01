import { Link } from 'react-router-dom';

export default function PoliticaPrivacidad() {
  const derechos = [
    { title: 'Acceso', desc: 'Solicitar información sobre tus datos personales que procesamos.' },
    { title: 'Rectificación', desc: 'Solicitar la corrección de datos inexactos o incompletos.' },
    { title: 'Supresión', desc: 'Solicitar la eliminación de tus datos personales ("Derecho al olvido").' },
    { title: 'Oposición', desc: 'Oponerte al tratamiento de tus datos en determinadas circunstancias.' },
    { title: 'Portabilidad', desc: 'Recibir tus datos en un formato estructurado y de uso común.' },
    { title: 'Limitación', desc: 'Restringir el procesamiento de tus datos en ciertos supuestos.' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      
      {/* Header */}
      <section className="relative py-24 bg-zinc-900 border-b border-zinc-800 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-zinc-950 to-zinc-950"></div>
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <p className="text-red-500 font-bold tracking-[0.2em] text-sm mb-4 uppercase">Protección de Datos</p>
          <h1 className="font-display text-5xl md:text-7xl mb-6 text-white">POLÍTICA DE PRIVACIDAD</h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Protección y tratamiento de tus datos personales conforme a la normativa vigente.
          </p>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="py-16 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 space-y-12">

          {/* 1. Responsable */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              1. Responsable del tratamiento
            </h2>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-sm space-y-3 text-zinc-300">
              <p><span className="text-zinc-500 font-semibold w-32 inline-block">Entidad:</span> Lobos Quad Rugby</p>
              <p><span className="text-zinc-500 font-semibold w-32 inline-block">Domicilio:</span> C/ dels Lleons, 39. C.P. 46022 Valencia, Valencia</p>
              <p><span className="text-zinc-500 font-semibold w-32 inline-block">Email:</span> lobosqr@gmail.com</p>
            </div>
          </div>

          {/* 2. Finalidad */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              2. Finalidad del tratamiento
            </h2>
            <p className="text-zinc-400 mb-4 leading-relaxed">
              Los datos personales que nos facilites serán utilizados exclusivamente para:
            </p>
            <ul className="space-y-3">
              {['Gestionar las consultas realizadas a través del formulario de contacto.', 'Atender solicitudes de información o colaboración.', 'Enviar comunicaciones relacionadas con nuestras actividades (solo con tu consentimiento previo).'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-300">
                  <span className="text-red-500 mt-1.5 text-xl leading-none">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Legitimación */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              3. Legitimación
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              La base legal para el tratamiento de tus datos es el <span className="text-white font-semibold">consentimiento explícito</span> del usuario al marcar las casillas correspondientes y enviar el formulario de contacto o inscripción.
            </p>
          </div>

          {/* 4. Conservación */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              4. Conservación de los datos
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Los datos se conservarán durante el tiempo necesario para atender la solicitud del usuario o mientras exista una obligación legal que nos requiera mantenerlos. Una vez cumplido este plazo, se procederá a su supresión segura.
            </p>
          </div>

          {/* 5. Derechos del usuario */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              5. Derechos del usuario (ARCO+)
            </h2>
            <p className="text-zinc-400 mb-6 leading-relaxed">
              El usuario puede ejercer los siguientes derechos en relación con sus datos personales:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {derechos.map((derecho, index) => (
                <div key={index} className="bg-zinc-900 border border-zinc-800 p-5 hover:border-red-600/50 transition-colors">
                  <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                    {derecho.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{derecho.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 bg-red-900/10 border border-red-900/30 p-4 rounded-sm">
              <p className="text-red-400 text-sm">
                <span className="font-bold">¿Cómo ejercerlos?</span> Puedes enviar un correo electrónico a <a href="mailto:lobosqr@gmail.com" className="underline hover:text-red-300">lobosqr@gmail.com</a> adjuntando una copia de tu DNI.
              </p>
            </div>
          </div>

          {/* 6. Compartir Información */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              6. Compartir Información
            </h2>
            <p className="text-zinc-400 mb-4 leading-relaxed">
              No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto en las siguientes circunstancias estrictamente necesarias:
            </p>
            <ul className="space-y-3">
              {['Cumplimiento de obligaciones legales o órdenes judiciales.', 'Proveedores de servicios que nos ayudan a operar nuestro negocio (siempre con acuerdos de confidencialidad).', 'Protección de nuestros derechos, propiedad o seguridad.'].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-300">
                  <span className="text-red-500 mt-1.5 text-xl leading-none">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 7. Destinatarios */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              7. Destinatarios de los datos
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              No se cederán datos a terceros, salvo obligación legal o para la prestación de servicios auxiliares bajo estrictas cláusulas de protección de datos.
            </p>
          </div>

          {/* 8. Seguridad */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              8. Seguridad de los datos
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Lobos Quad Rugby adopta las medidas técnicas y organizativas necesarias para garantizar la seguridad de los datos personales y evitar su alteración, pérdida, tratamiento o acceso no autorizado.
            </p>
          </div>

          {/* 9. Modificaciones */}
          <div>
            <h2 className="font-display text-3xl text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-8 bg-red-600 rounded-sm"></span>
              9. Modificaciones
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Nos reservamos el derecho a modificar la presente política para adaptarla a novedades legislativas o cambios en la web. Te recomendamos revisar esta política periódicamente para mantenerte informado sobre cómo protegemos tu información.
            </p>
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