import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.foxitech.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/login', '/sign/'],
      },
      {
        userAgent: [
          'GPTBot',
          'PerplexityBot',
          'ClaudeBot',
          'Google-Extended',
          'Bingbot',
          'Applebot',
        ],
        allow: ['/', '/llms.txt', '/llms-full.txt'],
        disallow: ['/admin/', '/api/', '/login', '/sign/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
