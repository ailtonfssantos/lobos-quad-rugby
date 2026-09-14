import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const initialFormData = {
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
};

export default function Join() {
  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (submitError) {
      setSubmitError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Introduce tu nombre completo.';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Introduce tu fecha de nacimiento.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Introduce tu ciudad.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Introduce tu teléfono.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Introduce tu email.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Introduce un email válido.';
    }

    if (!formData.privacyAccepted) {
      newErrors.privacyAccepted =
        'Debes aceptar la política de privacidad para continuar.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitError('');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/inscricoes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error('Error al enviar la solicitud');
      }

      const data = await response.json();

      console.log('Inscripción guardada:', data);

      setSuccess(true);
    } catch (error) {
      console.error('Error:', error);

      setSubmitError(
        'No hemos podido enviar tu solicitud. Comprueba tu conexión e inténtalo de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * ESTADO DE ÉXITO
   */
  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-3xl">

          {/* Decorative line */}
          <div className="w-full h-px bg-zinc-800 mb-12 relative">
            <div className="absolute left-0 top-0 w-24 h-px bg-red-600" />
          </div>

          <div className="text-center">

            {/* Check */}
            <div className="mx-auto mb-10 w-20 h-20 border border-red-600 flex items-center justify-center">
              <svg
                className="w-9 h-9 text-red-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12.5l4.5 4.5L19 7.5"
                />
              </svg>
            </div>

            <p className="text-red-500 text-xs font-bold uppercase tracking-[0.25em] mb-5">
              Solicitud recibida
            </p>

            <h1 className="font-display text-5xl md:text-7xl leading-none mb-7">
              YA FORMAS PARTE<br />
              DEL CAMINO.
            </h1>

            <p className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-10">
              Hemos recibido tu solicitud correctamente. Nuestro equipo
              revisará la información y se pondrá en contacto contigo para
              explicarte los siguientes pasos.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-red-600 text-white font-bold uppercase tracking-[0.15em] text-xs hover:bg-red-700 transition-colors"
              >
                Volver al inicio

                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14M13 6l6 6-6 6"
                  />
                </svg>
              </Link>

              <Link
                to="/competiciones"
                className="inline-flex items-center justify-center px-8 py-4 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-[0.15em] text-xs hover:border-zinc-500 hover:text-white transition-colors"
              >
                Ver competiciones
              </Link>
            </div>
          </div>

          <div className="w-full h-px bg-zinc-800 mt-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden border-b border-zinc-800">

        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <img
            src="/assets/partido.jpg"
            alt="Equipo Lobos Quad Rugby entrenando"
            className="w-full h-full object-cover object-center opacity-40 grayscale"
          />

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-zinc-950/90 to-zinc-950/95" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />

          {/* Glow */}
          <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-red-900/10 blur-3xl rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">

          <div className="max-w-5xl">

            <div className="flex items-center gap-4 mb-7">
              <span className="w-12 h-px bg-red-600" />

              <p className="text-red-500 font-bold text-xs uppercase tracking-[0.3em]">
                Forma parte de la manada
              </p>
            </div>

            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tight mb-8">
              ÚNETE
              <br />
              <span className="text-zinc-500">A LOS LOBOS.</span>
            </h1>

            <div className="grid md:grid-cols-2 gap-8 items-end">

              <p className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-xl">
                El rugby en silla de ruedas es competición, equipo y
                superación. Si quieres descubrirlo, este es el primer paso.
              </p>

              <div className="md:text-right">
                <p className="text-zinc-600 text-xs uppercase tracking-[0.2em]">
                  Valencia · Comunidad Valenciana
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PROCESO
      ========================================================= */}
      <section className="border-b border-zinc-800 bg-zinc-950">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800">

            {/* 01 */}
            <div className="py-10 md:py-12 md:pr-10">
              <div className="flex items-start justify-between mb-8">
                <span className="font-display text-5xl text-red-600">
                  01
                </span>

                <span className="text-zinc-700 text-[10px] uppercase tracking-[0.2em]">
                  Primer paso
                </span>
              </div>

              <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em] mb-3">
                Sin experiencia previa
              </h3>

              <p className="text-zinc-500 text-sm leading-relaxed">
                No necesitas haber jugado rugby antes. Cuéntanos quién eres
                y conoceremos contigo tu punto de partida.
              </p>
            </div>

            {/* 02 */}
            <div className="py-10 md:py-12 md:px-10">
              <div className="flex items-start justify-between mb-8">
                <span className="font-display text-5xl text-red-600">
                  02
                </span>

                <span className="text-zinc-700 text-[10px] uppercase tracking-[0.2em]">
                  Valoración
                </span>
              </div>

              <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em] mb-3">
                Evaluación funcional
              </h3>

              <p className="text-zinc-500 text-sm leading-relaxed">
                Conoceremos tus características y necesidades para valorar
                tu incorporación deportiva.
              </p>
            </div>

            {/* 03 */}
            <div className="py-10 md:py-12 md:pl-10">
              <div className="flex items-start justify-between mb-8">
                <span className="font-display text-5xl text-red-600">
                  03
                </span>

                <span className="text-zinc-700 text-[10px] uppercase tracking-[0.2em]">
                  Incorporación
                </span>
              </div>

              <h3 className="text-white font-bold text-sm uppercase tracking-[0.15em] mb-3">
                Integración progresiva
              </h3>

              <p className="text-zinc-500 text-sm leading-relaxed">
                El objetivo es que conozcas el deporte, el equipo y el
                entorno de entrenamiento de forma progresiva.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================
          FORM HEADER
      ========================================================= */}
      <section className="pt-20 md:pt-28 pb-10 bg-zinc-950">

        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          <div className="flex items-center gap-4 mb-5">
            <span className="w-10 h-px bg-red-600" />

            <span className="text-red-500 font-bold text-xs uppercase tracking-[0.25em]">
              Solicitud de incorporación
            </span>
          </div>

          <h2 className="font-display text-4xl md:text-6xl leading-none mb-5">
            CUÉNTANOS
            <br />
            <span className="text-zinc-600">SOBRE TI.</span>
          </h2>

          <p className="text-zinc-500 max-w-2xl leading-relaxed">
            Completa los siguientes datos. La información nos ayudará a
            conocerte antes de contactar contigo.
          </p>

        </div>
      </section>

      {/* =========================================================
          FORM
      ========================================================= */}
      <section className="pb-24 md:pb-32 bg-zinc-950">

        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* =====================================================
                DATOS PERSONALES
            ===================================================== */}
            <div className="bg-zinc-900 border border-zinc-800">

              <div className="px-6 md:px-8 py-6 border-b border-zinc-800 flex items-center justify-between">

                <div className="flex items-center gap-4">
                  <span className="font-display text-2xl text-red-600">
                    01
                  </span>

                  <h3 className="font-display text-xl md:text-2xl text-white">
                    DATOS PERSONALES
                  </h3>
                </div>

                <span className="hidden sm:block text-[10px] text-zinc-600 uppercase tracking-[0.2em]">
                  Información básica
                </span>

              </div>

              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Nombre */}
                <div className="md:col-span-2">
                  <FieldLabel
                    htmlFor="fullName"
                    label="Nombre completo"
                    required
                  />

                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                    className={inputClass(errors.fullName)}
                  />

                  <FieldError message={errors.fullName} />
                </div>

                {/* Fecha */}
                <div>
                  <FieldLabel
                    htmlFor="birthDate"
                    label="Fecha de nacimiento"
                    required
                  />

                  <input
                    id="birthDate"
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    autoComplete="bday"
                    required
                    className={inputClass(errors.birthDate)}
                  />

                  <FieldError message={errors.birthDate} />
                </div>

                {/* Ciudad */}
                <div>
                  <FieldLabel
                    htmlFor="city"
                    label="Ciudad"
                    required
                  />

                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    autoComplete="address-level2"
                    required
                    className={inputClass(errors.city)}
                  />

                  <FieldError message={errors.city} />
                </div>

                {/* Teléfono */}
                <div>
                  <FieldLabel
                    htmlFor="phone"
                    label="Teléfono"
                    required
                  />

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    required
                    className={inputClass(errors.phone)}
                  />

                  <FieldError message={errors.phone} />
                </div>

                {/* Email */}
                <div>
                  <FieldLabel
                    htmlFor="email"
                    label="Email"
                    required
                  />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    className={inputClass(errors.email)}
                  />

                  <FieldError message={errors.email} />
                </div>

              </div>
            </div>

            {/* =====================================================
                EXPERIENCIA
            ===================================================== */}
            <div className="bg-zinc-900 border border-zinc-800">

              <div className="px-6 md:px-8 py-6 border-b border-zinc-800 flex items-center justify-between">

                <div className="flex items-center gap-4">
                  <span className="font-display text-2xl text-red-600">
                    02
                  </span>

                  <h3 className="font-display text-xl md:text-2xl text-white">
                    EXPERIENCIA DEPORTIVA
                  </h3>
                </div>

                <span className="hidden sm:block text-[10px] text-zinc-600 uppercase tracking-[0.2em]">
                  Tu recorrido
                </span>

              </div>

              <div className="p-6 md:p-8 space-y-7">

                <div>
                  <FieldLabel
                    htmlFor="sportsExperience"
                    label="Experiencia deportiva previa"
                  />

                  <textarea
                    id="sportsExperience"
                    name="sportsExperience"
                    value={formData.sportsExperience}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Cuéntanos qué deportes has practicado y durante cuánto tiempo..."
                    className={textareaClass()}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                  <CheckboxField
                    name="rugbyExperience"
                    checked={formData.rugbyExperience}
                    onChange={handleChange}
                    label="He practicado rugby anteriormente"
                  />

                  <CheckboxField
                    name="wheelchairUser"
                    checked={formData.wheelchairUser}
                    onChange={handleChange}
                    label="Utilizo silla de ruedas"
                  />

                </div>

              </div>
            </div>

            {/* =====================================================
                INFORMACIÓN FUNCIONAL
            ===================================================== */}
            <div className="bg-zinc-900 border border-zinc-800">

              <div className="px-6 md:px-8 py-6 border-b border-zinc-800 flex items-center justify-between">

                <div className="flex items-center gap-4">
                  <span className="font-display text-2xl text-red-600">
                    03
                  </span>

                  <h3 className="font-display text-xl md:text-2xl text-white">
                    INFORMACIÓN FUNCIONAL
                  </h3>
                </div>

                <span className="hidden sm:block text-[10px] text-zinc-600 uppercase tracking-[0.2em]">
                  Opcional
                </span>

              </div>

              <div className="p-6 md:p-8 space-y-7">

                <div>
                  <FieldLabel
                    htmlFor="functionalClassification"
                    label="Clasificación funcional"
                    optional
                  />

                  <input
                    id="functionalClassification"
                    type="text"
                    name="functionalClassification"
                    value={formData.functionalClassification}
                    onChange={handleChange}
                    placeholder="Ej.: 2.5, 3.0..."
                    className={inputClass()}
                  />

                  <p className="text-zinc-600 text-xs mt-2">
                    Si ya tienes una clasificación deportiva, puedes indicarla
                    aquí.
                  </p>
                </div>

                <div>
                  <FieldLabel
                    htmlFor="functionalInformation"
                    label="Información funcional relevante"
                    optional
                  />

                  <textarea
                    id="functionalInformation"
                    name="functionalInformation"
                    value={formData.functionalInformation}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Indica cualquier información que consideres relevante para conocerte mejor..."
                    className={textareaClass()}
                  />
                </div>

              </div>
            </div>

            {/* =====================================================
                MENSAJE
            ===================================================== */}
            <div className="bg-zinc-900 border border-zinc-800">

              <div className="px-6 md:px-8 py-6 border-b border-zinc-800 flex items-center gap-4">
                <span className="font-display text-2xl text-red-600">
                  04
                </span>

                <h3 className="font-display text-xl md:text-2xl text-white">
                  MENSAJE
                </h3>
              </div>

              <div className="p-6 md:p-8">

                <FieldLabel
                  htmlFor="message"
                  label="¿Hay algo más que quieras contarnos?"
                  optional
                />

                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Escribe aquí cualquier información, pregunta o comentario..."
                  className={textareaClass()}
                />

              </div>
            </div>

            {/* =====================================================
                PRIVACIDAD + SUBMIT
            ===================================================== */}
            <div className="bg-zinc-900 border border-zinc-800">

              <div className="p-6 md:p-8">

                <label className="flex items-start gap-4 cursor-pointer group">

                  <input
                    type="checkbox"
                    name="privacyAccepted"
                    checked={formData.privacyAccepted}
                    onChange={handleChange}
                    required
                    className="mt-1 w-5 h-5 shrink-0 accent-red-600 cursor-pointer"
                    aria-invalid={Boolean(errors.privacyAccepted)}
                  />

                  <span className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">
                    Entiendo que el envío de esta solicitud no garantiza mi
                    incorporación al equipo y que será necesario realizar una
                    valoración o prueba previa. Acepto la política de
                    privacidad y el tratamiento de mis datos.
                    <span className="text-red-500 ml-1">*</span>
                  </span>

                </label>

                <FieldError message={errors.privacyAccepted} />

                {/* Error general */}
                {submitError && (
                  <div
                    role="alert"
                    className="mt-6 border border-red-900/60 bg-red-950/20 px-4 py-4 flex items-start gap-3"
                  >
                    <svg
                      className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path
                        strokeLinecap="round"
                        d="M12 8v4M12 16h.01"
                      />
                    </svg>

                    <p className="text-red-400 text-sm">
                      {submitError}
                    </p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative w-full mt-7 py-5 bg-red-600 text-white font-bold uppercase tracking-[0.2em] text-xs overflow-hidden transition-colors hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
                >

                  <span className="relative z-10 flex items-center justify-center gap-3">

                    {submitting ? (
                      <>
                        <svg
                          className="w-4 h-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="9"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="opacity-30"
                          />

                          <path
                            d="M21 12a9 9 0 0 1-9 9"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>

                        Enviando solicitud...
                      </>
                    ) : (
                      <>
                        Enviar solicitud

                        <svg
                          className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14M13 6l6 6-6 6"
                          />
                        </svg>
                      </>
                    )}

                  </span>
                </button>

                <p className="text-center text-zinc-700 text-[10px] uppercase tracking-[0.15em] mt-4">
                  * Campos obligatorios
                </p>

              </div>
            </div>

          </form>
        </div>
      </section>

      {/* =========================================================
          FINAL STATEMENT
      ========================================================= */}
      <section className="border-t border-zinc-800 bg-zinc-900">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">

          <div className="grid md:grid-cols-2 gap-10 items-end">

            <div>
              <p className="text-red-500 text-xs font-bold uppercase tracking-[0.25em] mb-5">
                Lobos Quad Rugby
              </p>

              <h2 className="font-display text-5xl md:text-7xl leading-[0.9]">
                NO ES SOLO
                <br />
                <span className="text-zinc-600">RUGBY.</span>
              </h2>
            </div>

            <div className="md:text-right">
              <p className="text-zinc-500 max-w-md md:ml-auto leading-relaxed">
                Es competición. Es equipo. Es encontrar tu lugar dentro de
                una manada.
              </p>

              <Link
                to="/sobre-nosotros"
                className="inline-flex items-center gap-3 mt-6 text-white text-xs font-bold uppercase tracking-[0.2em] hover:text-red-500 transition-colors"
              >
                Conoce nuestra historia

                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14M13 6l6 6-6 6"
                  />
                </svg>
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

/* =============================================================
   COMPONENTES AUXILIARES
============================================================= */

function FieldLabel({
  htmlFor,
  label,
  required = false,
  optional = false,
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-2 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
    >
      {label}

      {required && (
        <span className="text-red-500">*</span>
      )}

      {optional && (
        <span className="text-zinc-700 normal-case tracking-normal font-normal">
          · opcional
        </span>
      )}
    </label>
  );
}

function FieldError({ message }) {
  if (!message) return null;

  return (
    <p className="text-red-500 text-xs mt-2" role="alert">
      {message}
    </p>
  );
}

function inputClass(hasError = false) {
  return `
    w-full
    bg-zinc-950
    border
    ${hasError ? 'border-red-600' : 'border-zinc-700'}
    text-white
    px-4
    py-3.5
    text-sm
    placeholder:text-zinc-700
    focus:outline-none
    focus:border-red-600
    focus:ring-1
    focus:ring-red-600/20
    transition-all
  `.replace(/\s+/g, ' ').trim();
}

function textareaClass() {
  return `
    w-full
    bg-zinc-950
    border
    border-zinc-700
    text-white
    px-4
    py-3.5
    text-sm
    placeholder:text-zinc-700
    focus:outline-none
    focus:border-red-600
    focus:ring-1
    focus:ring-red-600/20
    transition-all
    resize-none
  `.replace(/\s+/g, ' ').trim();
}

function CheckboxField({
  name,
  checked,
  onChange,
  label,
}) {
  return (
    <label className="flex items-center gap-4 p-4 border border-zinc-800 bg-zinc-950 cursor-pointer group hover:border-zinc-700 transition-colors">

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 accent-red-600 cursor-pointer shrink-0"
      />

      <span className="text-zinc-500 text-sm group-hover:text-zinc-300 transition-colors">
        {label}
      </span>

    </label>
  );
}