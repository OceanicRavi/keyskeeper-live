/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.keyskeeper.co.nz',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: ['/admin/*', '/api/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
    additionalSitemaps: [
      'https://www.keyskeeper.co.nz/sitemap.xml',
    ],
  },
  changefreq: 'daily',
  priority: 0.7,
  transform: async (config, path) => {
    // Custom priority for different pages
    let priority = 0.7
    let changefreq = 'weekly'

    if (path === '/') {
      priority = 1.0
      changefreq = 'daily'
    } else if (path.startsWith('/search')) {
      priority = 0.9
      changefreq = 'daily'
    } else if (path.startsWith('/property/')) {
      priority = 0.8
      changefreq = 'daily'
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    }
  },
}