import { useEffect } from 'react';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  structuredData?: object;
}

export function useSEO({
  title,
  description,
  keywords = [],
  image = '/img/v-class1.jpg',
  url = '/',
  type = 'website',
  structuredData,
}: SEOData) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yassline.com';
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const keywordsString = keywords.length > 0 ? keywords.join(', ') : '';

  useEffect(() => {
    // Update title
    if (title) {
      document.title = title;
    }

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.content = content;
    };

    // Description
    if (description) {
      updateMetaTag('description', description);
    }

    // Keywords
    if (keywordsString) {
      updateMetaTag('keywords', keywordsString);
    }

    // Open Graph
    if (title) updateMetaTag('og:title', title, true);
    if (description) updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', fullImageUrl, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'Yassline Tour', true);
    updateMetaTag('og:locale', 'es_ES', true);

    // Twitter
    updateMetaTag('twitter:card', 'summary_large_image');
    if (title) updateMetaTag('twitter:title', title);
    if (description) updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', fullImageUrl);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = fullUrl;

    // Structured Data
    if (structuredData) {
      // Remove existing structured data script
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Add new structured data script
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [title, description, keywordsString, fullImageUrl, fullUrl, type, structuredData]);
}
