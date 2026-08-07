import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.foxitech.in';

  const routes = [
    '',
    '/blog',
    '/careers',
    '/support',
    '/privacy-policy',
    '/terms-of-service',
    '/refund-policy',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' || route === '/blog' ? 'daily' : 'monthly',
    priority: route === '' ? 1.0 : route === '/blog' || route === '/support' ? 0.8 : 0.5,
  }));
}
