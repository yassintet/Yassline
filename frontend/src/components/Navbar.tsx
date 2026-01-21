import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-[#FF385C] hover:text-[#E01E4F] transition-colors cursor-pointer">
              Yassline Tour
            </h1>
          </Link>
          
          {/* Navigation Menu */}
          <div className="flex items-center gap-8">
            <Link 
              href="/" 
              className="text-gray-700 font-medium hover:text-[#FF385C] transition-colors"
            >
              Inicio
            </Link>
            <Link 
              href="/circuitos" 
              className="text-gray-700 font-medium hover:text-[#FF385C] transition-colors"
            >
              Circuitos
            </Link>
            <Link 
              href="/transporte" 
              className="text-gray-700 font-medium hover:text-[#FF385C] transition-colors"
            >
              Transporte
            </Link>
            <Link 
              href="/contacto" 
              className="text-gray-700 font-medium hover:text-[#FF385C] transition-colors"
            >
              Contacto
            </Link>
            {/* Login Button */}
            <Link
              href="/login"
              className="px-6 py-2 rounded-full border border-gray-300 hover:shadow-md transition-shadow font-semibold text-gray-700"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
