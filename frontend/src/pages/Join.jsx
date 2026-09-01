import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Join() {
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    city: '',
    phone: '',
    email: '',
    sportsExperience: '',
    rugbyExperience: false,
    wheelchairUser: false,
    functionalClassification: '',
    functionalInformation: '',
    message: '',
    privacyAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpa o erro do campo quando o usuário digita
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Nombre completo requerido';
    if (!formData.birthDate) newErrors.birthDate = 'Fecha de nacimiento requerida';
    if (!formData.city.trim()) newErrors.city = 'Ciudad requerida';
    if (!formData.phone.trim()) newErrors.phone = 'Teléfono requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'Email requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email no válido';
    }
    if (!formData.privacyAccepted) {
      newErrors.privacyAccepted = 'Debes aceptar la política de privacidad';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
  
    try {
      // Enviar dados para o backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/inscricoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar inscrição');
      }

      const data = await response.json();
      console.log('Inscrição salva:', data);
      
      setSubmitting(false);
      setSuccess(true);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao enviar inscrição. Tente novamente.');
      setSubmitting(false);
    }
  };

  if (success) {
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
            Hemos recibido tu solicitud correctamente. Nuestro equipo se pondrá en contacto contigo en los próximos días para coordinar una prueba de valoración.
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
      <section className="relative py-24 bg-zinc-900 border-b border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-zinc-950 to-zinc-950"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <p className="text-red-500 font-bold tracking-[0.2em] text-sm mb-4 uppercase">Forma parte de la manada</p>
          <h1 className="font-display text-6xl md:text-7xl mb-6 text-white">ÚNETE A LOS LOBOS</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
            ¿Tienes lo que hay que tener? Completa el formulario y da el primer paso hacia tu incorporación al equipo.
          </p>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-12 bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <div className="text-red-600 font-display text-4xl mb-3">01</div>
              <h3 className="font-bold text-white mb-2 uppercase tracking-wider text-sm">Sin experiencia previa</h3>
              <p className="text-zinc-500 text-sm">No necesitas haber jugado rugby antes. Te enseñamos todo desde cero.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <div className="text-red-600 font-display text-4xl mb-3">02</div>
              <h3 className="font-bold text-white mb-2 uppercase tracking-wider text-sm">Evaluación funcional</h3>
              <p className="text-zinc-500 text-sm">Realizarás una prueba de valoración para determinar tu clasificación.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6">
              <div className="text-red-600 font-display text-4xl mb-3">03</div>
              <h3 className="font-bold text-white mb-2 uppercase tracking-wider text-sm">Integración gradual</h3>
              <p className="text-zinc-500 text-sm">Te incorporaremos al ritmo adecuado para tu desarrollo deportivo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulário */}
      <section className="py-16 bg-zinc-950">
        <div className="max-w-3xl mx-auto px-4">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Dados Pessoais */}
            <div className="bg-zinc-900 border border-zinc-800 p-8">
              <h2 className="font-display text-2xl text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-red-600"></span>
                Datos Personales
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full bg-zinc-950 border ${errors.fullName ? 'border-red-600' : 'border-zinc-700'} text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors`}
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className={`w-full bg-zinc-950 border ${errors.birthDate ? 'border-red-600' : 'border-zinc-700'} text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors`}
                  />
                  {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full bg-zinc-950 border ${errors.city ? 'border-red-600' : 'border-zinc-700'} text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors`}
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full bg-zinc-950 border ${errors.phone ? 'border-red-600' : 'border-zinc-700'} text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full bg-zinc-950 border ${errors.email ? 'border-red-600' : 'border-zinc-700'} text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Experiência Esportiva */}
            <div className="bg-zinc-900 border border-zinc-800 p-8">
              <h2 className="font-display text-2xl text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-red-600"></span>
                Experiencia Deportiva
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                    Experiencia deportiva previa
                  </label>
                  <textarea
                    name="sportsExperience"
                    value={formData.sportsExperience}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors resize-none"
                    placeholder="Cuéntanos sobre tu experiencia deportiva..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="rugbyExperience"
                      checked={formData.rugbyExperience}
                      onChange={handleChange}
                      className="w-5 h-5 accent-red-600"
                    />
                    <span className="text-zinc-400 group-hover:text-white transition-colors text-sm">
                      He practicado rugby anteriormente
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="wheelchairUser"
                      checked={formData.wheelchairUser}
                      onChange={handleChange}
                      className="w-5 h-5 accent-red-600"
                    />
                    <span className="text-zinc-400 group-hover:text-white transition-colors text-sm">
                      Utilizo silla de ruedas
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Informações Funcionais */}
            <div className="bg-zinc-900 border border-zinc-800 p-8">
              <h2 className="font-display text-2xl text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-red-600"></span>
                Información Funcional
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                    Clasificación funcional (si la conoces)
                  </label>
                  <input
                    type="text"
                    name="functionalClassification"
                    value={formData.functionalClassification}
                    onChange={handleChange}
                    className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors"
                    placeholder="Ej: 2.5, 3.0..."
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs uppercase tracking-widest mb-2">
                    Información funcional relevante
                  </label>
                  <textarea
                    name="functionalInformation"
                    value={formData.functionalInformation}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors resize-none"
                    placeholder="Información sobre tu condición física..."
                  />
                </div>
              </div>
            </div>

            {/* Mensagem Adicional */}
            <div className="bg-zinc-900 border border-zinc-800 p-8">
              <h2 className="font-display text-2xl text-white mb-6 flex items-center gap-3">
                <span className="w-8 h-[2px] bg-red-600"></span>
                Mensaje Adicional
              </h2>
              
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 transition-colors resize-none"
                placeholder="¿Algo más que quieras contarnos?"
              />
            </div>

            {/* Privacidade e Submit */}
            <div className="bg-zinc-900 border border-zinc-800 p-8">
              <label className="flex items-start gap-3 cursor-pointer mb-6">
                <input
                  type="checkbox"
                  name="privacyAccepted"
                  checked={formData.privacyAccepted}
                  onChange={handleChange}
                  className="w-5 h-5 accent-red-600 mt-1"
                />
                <span className="text-zinc-400 text-sm leading-relaxed">
                  Entiendo que el envío de esta solicitud no garantiza mi incorporación al equipo y que será necesario realizar una evaluación o prueba previa. Acepto la política de privacidad y el tratamiento de mis datos. *
                </span>
              </label>
              {errors.privacyAccepted && <p className="text-red-500 text-xs mb-4">{errors.privacyAccepted}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:bg-zinc-700 disabled:cursor-not-allowed"
              >
                {submitting ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>

          </form>
        </div>
      </section>
    </div>
  );
}