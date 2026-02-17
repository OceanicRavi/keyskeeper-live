// app/sitemap.xml/route.ts
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const baseUrl = 'https://www.keyskeeper.co.nz'
  
  // Only fetch available properties
  const { data: properties } = await supabase
    .from('properties')
    .select('id, updated_at')
    .eq('is_available', true)
    .limit(1000)
  
  const propertyUrls = (properties || []).map((property) => `
    <url>
      <loc>${baseUrl}/properties/${property.id}</loc>
      <lastmod>${new Date(property.updated_at).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`
  ).join('')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

    <url>
      <loc>${baseUrl}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>

    <url>
      <loc>${baseUrl}/search</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
    </url>

    <url>
      <loc>${baseUrl}/landlord</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>

    <url>
      <loc>${baseUrl}/tenant</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>

    <url>
      <loc>${baseUrl}/property-appraisal</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>

    <url>
      <loc>${baseUrl}/maintenance-request</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
    </url>

    ${propertyUrls}

  </urlset>`

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
}