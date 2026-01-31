import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yassline.com';
  const now = new Date();

  return [
    // Homepage - Máxima prioridad
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          es: `${baseUrl}`,
          en: `${baseUrl}/en`,
          fr: `${baseUrl}/fr`,
        },
      },
    },
    // Páginas principales de servicios - Alta prioridad
    {
      url: `${baseUrl}/transporte`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: {
        languages: {
          es: `${baseUrl}/transporte`,
          en: `${baseUrl}/en/transporte`,
          fr: `${baseUrl}/fr/transporte`,
        },
      },
    },
    {
      url: `${baseUrl}/circuitos`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: {
        languages: {
          es: `${baseUrl}/circuitos`,
          en: `${baseUrl}/en/circuitos`,
          fr: `${baseUrl}/fr/circuitos`,
        },
      },
    },
    {
      url: `${baseUrl}/vehiculos`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          es: `${baseUrl}/vehiculos`,
          en: `${baseUrl}/en/vehiculos`,
          fr: `${baseUrl}/fr/vehiculos`,
        },
      },
    },
    // Páginas informativas - Media prioridad
    {
      url: `${baseUrl}/contacto`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sobre-nosotros`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/politica-privacidad`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terminos-condiciones`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
