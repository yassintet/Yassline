interface StructuredDataProps {
  type: "Organization" | "LocalBusiness" | "TravelAgency" | "Service" | "BreadcrumbList" | "WebSite" | "FAQPage" | "Product" | "TouristTrip";
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://yassline.com";

  const getStructuredData = () => {
    switch (type) {
      case "Organization":
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": `${baseUrl}#organization`,
          name: "Yassline Tour",
          url: baseUrl,
          logo: {
            "@type": "ImageObject",
            url: `${baseUrl}/img/v-class1.jpg`,
            width: 1200,
            height: 630,
          },
          contactPoint: [
            {
              "@type": "ContactPoint",
              telephone: "+212-669-215-611",
              contactType: "customer service",
              areaServed: {
                "@type": "Country",
                name: "Morocco",
              },
              availableLanguage: ["Spanish", "English", "French", "Arabic"],
            },
            {
              "@type": "ContactPoint",
              email: "info@yassline.com",
              contactType: "customer service",
            },
          ],
          address: {
            "@type": "PostalAddress",
            addressCountry: "MA",
            addressLocality: "Marruecos",
          },
          sameAs: [
            // Agregar redes sociales si las tienen
          ],
          ...data,
        };

      case "LocalBusiness":
      case "TravelAgency":
        return {
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          "@id": `${baseUrl}#travelagency`,
          name: "Yassline Tour",
          description: "Servicios de transporte turístico premium en Marruecos con flota Mercedes-Benz. Circuitos exclusivos, traslados aeropuerto 24/7 y transporte interciudades.",
          url: baseUrl,
          telephone: "+212-669-215-611",
          email: "info@yassline.com",
          address: {
            "@type": "PostalAddress",
            addressCountry: "MA",
            addressLocality: "Marruecos",
            addressRegion: "Marruecos",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: "31.7917",
            longitude: "-7.0926",
          },
          priceRange: "$$",
          openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "00:00",
            closes: "23:59",
          },
          areaServed: {
            "@type": "Country",
            name: "Morocco",
          },
          ...data,
        };

      case "Service":
        return {
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Transportation Service",
          provider: {
            "@type": "TravelAgency",
            name: "Yassline Tour",
            "@id": `${baseUrl}#travelagency`,
          },
          areaServed: {
            "@type": "Country",
            name: "Morocco",
          },
          availableChannel: {
            "@type": "ServiceChannel",
            serviceUrl: baseUrl,
            servicePhone: "+212-669-215-611",
            serviceEmail: "info@yassline.com",
          },
          ...data,
        };

      case "FAQPage":
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: data.faqItems || [],
          ...data,
        };

      case "Product":
        return {
          "@context": "https://schema.org",
          "@type": "Product",
          brand: {
            "@type": "Brand",
            name: "Yassline Tour",
          },
          offers: {
            "@type": "Offer",
            availability: "https://schema.org/InStock",
            priceCurrency: "MAD",
            ...data.offers,
          },
          aggregateRating: data.aggregateRating ? {
            "@type": "AggregateRating",
            ratingValue: data.aggregateRating.ratingValue,
            reviewCount: data.aggregateRating.reviewCount,
          } : undefined,
          ...data,
        };

      case "TouristTrip":
        return {
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: data.name,
          description: data.description,
          itinerary: {
            "@type": "ItemList",
            itemListElement: data.itinerary || [],
          },
          tourBookingPage: data.tourBookingPage || baseUrl,
          ...data,
        };

      case "BreadcrumbList":
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: data.items || [],
        };

      case "WebSite":
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${baseUrl}#website`,
          name: "Yassline Tour",
          url: baseUrl,
          publisher: {
            "@id": `${baseUrl}#organization`,
          },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${baseUrl}/transporte?search={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
          inLanguage: ["es-ES", "en-US", "fr-FR"],
          ...data,
        };

      default:
        return data;
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(getStructuredData()) }}
    />
  );
}
