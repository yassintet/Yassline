import Head from "next/head";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
}

export default function SEO({
  title = "Yassline Tour - Transporte Turístico Premium en Marruecos",
  description = "Descubre Marruecos con Yassline Tour. Servicios de transporte turístico de lujo con Mercedes V-Class, Vito y Sprinter.",
  keywords = [],
  image = "/img/v-class1.jpg",
  url = "/",
  type = "website",
  structuredData,
}: SEOProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yassline.com";
  const fullImageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`;
  const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
  const keywordsString = keywords.length > 0 ? keywords.join(", ") : undefined;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        {keywordsString && <meta name="keywords" content={keywordsString} />}
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={fullImageUrl} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:type" content={type} />
        <meta property="og:site_name" content="Yassline Tour" />
        <meta property="og:locale" content="es_ES" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={fullImageUrl} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={fullUrl} />
        
        {/* Structured Data */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
      </Head>
    </>
  );
}
