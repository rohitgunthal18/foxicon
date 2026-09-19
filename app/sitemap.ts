import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.foxitech.in';

  const routes: {
    url: string;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
  }[] = [
    { url: '', changeFrequency: 'daily', priority: 1.0 },
    { url: '/services/web-design', changeFrequency: 'weekly', priority: 0.9 },
    { url: '/services/local-seo', changeFrequency: 'weekly', priority: 0.9 },
    { url: '/services/google-ads', changeFrequency: 'weekly', priority: 0.9 },
    { url: '/services/custom-software', changeFrequency: 'weekly', priority: 0.9 },
    { url: '/services/ai-automation', changeFrequency: 'weekly', priority: 0.9 },
    { url: '/pricing', changeFrequency: 'weekly', priority: 0.9 },
    { url: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { url: '/contact', changeFrequency: 'monthly', priority: 0.9 },
    { url: '/locations/pune', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/locations/bangalore', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/locations/hyderabad', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/locations/delhi', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/locations/mumbai', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/locations/kolkata', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/locations/chennai', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/locations/coimbatore', changeFrequency: 'weekly', priority: 0.8 },
    { url: '/blog', changeFrequency: 'daily', priority: 0.8 },
    { url: '/careers', changeFrequency: 'weekly', priority: 0.7 },
    { url: '/support', changeFrequency: 'monthly', priority: 0.8 },
    { url: '/privacy-policy', changeFrequency: 'monthly', priority: 0.3 },
    { url: '/terms-of-service', changeFrequency: 'monthly', priority: 0.3 },
    { url: '/refund-policy', changeFrequency: 'monthly', priority: 0.3 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
