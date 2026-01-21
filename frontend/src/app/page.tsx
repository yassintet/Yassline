import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 bg-gradient-to-b from-[#0066CC] to-[#004499]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Descubre Marruecos
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Viaja con confianza y comodidad en nuestros vehículos de lujo
            </p>
          </div>

          {/* Floating Search Bar */}
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-white rounded-full shadow-2xl p-2 flex flex-col md:flex-row items-center gap-2">
              {/* Origen */}
              <div className="flex-1 w-full md:w-auto px-6 py-4 border-r border-gray-200">
                <label className="text-xs font-semibold text-gray-700 block mb-1">Origen</label>
                <input
                  type="text"
                  placeholder="¿Dónde quieres empezar?"
                  className="w-full text-gray-900 placeholder-gray-400 outline-none"
                />
              </div>
              {/* Fecha */}
              <div className="flex-1 w-full md:w-auto px-6 py-4 border-r border-gray-200">
                <label className="text-xs font-semibold text-gray-700 block mb-1">Fecha</label>
                <input
                  type="date"
                  className="w-full text-gray-900 outline-none"
                />
              </div>
              {/* Pasajeros */}
              <div className="flex-1 w-full md:w-auto px-6 py-4">
                <label className="text-xs font-semibold text-gray-700 block mb-1">Pasajeros</label>
                <input
                  type="number"
                  placeholder="¿Cuántos?"
                  min="1"
                  className="w-full text-gray-900 placeholder-gray-400 outline-none"
                />
              </div>
              {/* Search Button */}
              <button className="bg-[#FF385C] text-white rounded-full px-8 py-4 font-semibold hover:bg-[#E01E4F] transition-colors whitespace-nowrap">
                Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Flota Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Nuestra Flota</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Vehículos de alta gama para cada tipo de viaje
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mercedes V-Class - VIP */}
            <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <div className="aspect-[4/3] relative">
                <Image
                  src="/img/v-class1.jpg"
                  alt="Mercedes V-Class Yassline Tour"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white text-purple-600 px-3 py-1 rounded-full text-xs font-semibold">
                    VIP
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mercedes V-Class</h3>
                <p className="text-gray-600 mb-4">Lujo y confort máximo para experiencias premium</p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    7 plazas VIP
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Asientos de cuero
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Entretenimiento a bordo
                  </li>
                </ul>
              </div>
            </div>

            {/* Mercedes Vito - Familia */}
            <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <div className="aspect-[4/3] relative">
                <Image
                  src="/img/vito (6).jpg"
                  alt="Mercedes Vito Yassline Tour"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
                    FAMILIA
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mercedes Vito</h3>
                <p className="text-gray-600 mb-4">Ideal para familias y grupos pequeños</p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    8 plazas cómodas
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Amplio espacio de carga
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Confort y seguridad
                  </li>
                </ul>
              </div>
            </div>

            {/* Mercedes Sprinter - Grupos */}
            <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <div className="aspect-[4/3] relative">
                <Image
                  src="/img/sprinter.jpg"
                  alt="Mercedes Sprinter Yassline Tour"
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                    GRUPOS
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mercedes Sprinter</h3>
                <p className="text-gray-600 mb-4">Perfecto para grupos grandes y excursiones</p>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Hasta 16 plazas
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Gran capacidad de equipaje
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    Climatización completo
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Circuitos Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Circuitos Destacados</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre las rutas más increíbles de Marruecos
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              {/* Image/Map Side */}
              <div className="md:w-1/2 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 relative min-h-[400px]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-64 h-64 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-900">Ruta Completa</p>
                    <p className="text-xs text-gray-600 mt-1">5 ciudades • 7 días</p>
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className="md:w-1/2 p-8 md:p-12">
                <div className="mb-4">
                  <span className="bg-[#FF385C] text-white px-4 py-1 rounded-full text-xs font-semibold">
                    POPULAR
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Tour Completo de Marruecos
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Una experiencia inolvidable recorriendo las ciudades más emblemáticas de Marruecos. 
                  Desde las costas del norte hasta el corazón imperial, descubre la rica cultura y 
                  los paisajes impresionantes de este fascinante país.
                </p>

                {/* Route Points */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Tánger</h4>
                      <p className="text-sm text-gray-600">Puerta de entrada desde Europa</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Chefchaouen</h4>
                      <p className="text-sm text-gray-600">La ciudad azul de las montañas</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Casablanca</h4>
                      <p className="text-sm text-gray-600">Capital económica y moderna</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Fez</h4>
                      <p className="text-sm text-gray-600">Ciudad imperial con historia milenaria</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold">5</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Marrakech</h4>
                      <p className="text-sm text-gray-600">Perla del sur, ciudad roja</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">Desde 899€</p>
                    <p className="text-sm text-gray-600">por persona</p>
                  </div>
                  <button className="bg-[#FF385C] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#E01E4F] transition-colors">
                    Reservar ahora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
