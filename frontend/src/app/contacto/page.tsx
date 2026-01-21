"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle,
  Send,
  CheckCircle2
} from "lucide-react";

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    servicio: "",
    mensaje: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica de envío del formulario
    console.log("Form submitted:", formData);
    alert("¡Mensaje enviado! Nos pondremos en contacto contigo pronto.");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const whatsappNumber = "212669215611";
  const whatsappMessage = "Hola, me gustaría obtener más información sobre sus servicios.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Header Section */}
      <section className="relative pt-20 pb-16 md:pb-24">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0066CC]/80 to-[#004499]/90"></div>
          <Image
            src="/img/Marrakech-cityf.jpg"
            alt="Ciudad de Marruecos"
            fill
            className="object-cover blur-sm"
            priority
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Hablemos de tu Viaje
            </h1>
            <p className="text-xl text-white/90">
              Estamos aquí para hacer realidad tu experiencia perfecta en Marruecos
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Sobre Yassline Tour
            </h2>
            <div className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto space-y-4">
              <p>
                Creemos que viajar no se trata solo de visitar nuevos lugares, sino de crear recuerdos para toda la vida. 
                Nuestra misión es brindarle la mejor experiencia de viaje, ofreciéndole una gama completa de servicios y 
                tours personalizados. Desde el pasaje de avión hasta el alojamiento, el transporte y las actividades, 
                nos encargamos de todo. Nuestro equipo de expertos en viajes tiene un amplio conocimiento de destinos de 
                todo el mundo y trabajará con usted para crear un itinerario a su medida que supere sus expectativas.
              </p>
              <p>
                Entendemos que cada estilo de viaje es único, por eso ofrecemos una variedad de opciones de tours, desde 
                viajes llenos de aventura hasta escapadas de lujo. Ya sea que le interese explorar ruinas antiguas, 
                sumergirse en las culturas locales o simplemente relajarse en la playa, tenemos algo para todos. Con 
                Yassline Tour, puede estar seguro de que sus próximas vacaciones serán un viaje inolvidable lleno de 
                emocionantes descubrimientos y recuerdos inolvidables.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Información de Contacto</h2>
              
              <div className="space-y-6 mb-8">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#0066CC] flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Teléfono</h3>
                    <a 
                      href={`tel:+212669215611`}
                      className="text-lg text-gray-600 hover:text-[#0066CC] transition-colors"
                    >
                      +212 669 215 611
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#FF385C] flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a 
                      href="mailto:info@yassline.com"
                      className="text-lg text-gray-600 hover:text-[#FF385C] transition-colors"
                    >
                      info@yassline.com
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Dirección</h3>
                    <p className="text-lg text-gray-600">
                      Tanger / Casablanca, Marruecos
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-6 h-6" />
                Contactar por WhatsApp
              </a>

              {/* Features */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Respuesta en menos de 24 horas</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Atención personalizada</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>Presupuestos sin compromiso</span>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Envíanos un Mensaje</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre */}
                <div>
                  <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-none transition-all text-gray-900"
                    placeholder="Tu nombre"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-none transition-all text-gray-900"
                    placeholder="tu@email.com"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-none transition-all text-gray-900"
                    placeholder="+212 XXX XXX XXX"
                  />
                </div>

                {/* Tipo de Servicio */}
                <div>
                  <label htmlFor="servicio" className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Servicio
                  </label>
                  <select
                    id="servicio"
                    name="servicio"
                    value={formData.servicio}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-none transition-all text-gray-900 bg-white"
                  >
                    <option value="">Selecciona un servicio</option>
                    <option value="transporte">Transporte</option>
                    <option value="circuito">Circuito</option>
                    <option value="hotel">Hotel</option>
                  </select>
                </div>

                {/* Mensaje */}
                <div>
                  <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-700 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-none transition-all text-gray-900 resize-none"
                    placeholder="Cuéntanos sobre tu viaje..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#FF385C] to-[#E01E4F] text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Nuestra Ubicación</h2>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">Mapa de Ubicación</p>
                <p className="text-gray-500 text-sm mt-2">Tanger / Casablanca, Marruecos</p>
              </div>
              {/* Uncomment and add your Google Maps embed code here */}
              {/* <iframe
                src="https://www.google.com/maps/embed?pb=YOUR_EMBED_CODE"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe> */}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
