import './globals.css';
import type { Metadata } from 'next';

// Enhanced SEO metadata with comprehensive optimization
export const metadata: Metadata = {
  title: 'Keyskeeper - Property & Room Rental Management | New Zealand',
  description: 'Professional property management in New Zealand. Room-by-room & whole-home rentals in Auckland, Wellington, Christchurch. AI-powered compliance, automated payments, maintenance management. Your trusted keys keeper for rental properties.',
  
  // Enhanced keywords targeting NZ property market
  keywords: [
    'property management New Zealand',
    'room rental Auckland',
    'property rental Wellington',
    'rental management Christchurch',
    'boarding house management',
    'student accommodation NZ',
    'property investment management',
    'rental property compliance',
    'tenancy services New Zealand',
    'property maintenance Auckland',
    'rental income management',
    'residential property management',
    'commercial property rental',
    'property portfolio management',
    'NZ rental laws compliance',
    'automated rent collection',
    'property inspection services',
    'tenant screening NZ',
    'vacation rental management',
    'Airbnb property management'
  ].join(', '),

  authors: [{ name: 'Keyskeeper', url: 'https://www.keyskeeper.co.nz' }],
  creator: 'Keyskeeper',
  publisher: 'Keyskeeper',
  
  // Enhanced robots directive
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Geographic and language targeting
  alternates: {
    canonical: 'https://www.keyskeeper.co.nz',
    languages: {
      'en-NZ': 'https://www.keyskeeper.co.nz',
      'en-AU': 'https://www.keyskeeper.co.nz/au',
    },
  },

  // Enhanced Open Graph for social sharing
  openGraph: {
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.keyskeeper.co.nz',
    siteName: 'Keyskeeper - Property Management New Zealand',
    title: 'Keyskeeper - Professional Property & Room Rental Management | New Zealand',
    description: 'Transform your property investment with Keyskeeper. Expert room-by-room & whole-home management across Auckland, Wellington, Christchurch. AI-powered compliance, automated payments & maintenance.',
    images: [
      {
        url: 'https://www.keyskeeper.co.nz/keyskeeper.png',
        width: 1200,
        height: 630,
        alt: 'Keyskeeper Property Management - Professional rental management services in New Zealand',
        type: 'image/png',
      },
      {
        url: 'https://www.keyskeeper.co.nz/keyskeeper-square.png',
        width: 600,
        height: 600,
        alt: 'Keyskeeper Logo - Your trusted property management partner',
        type: 'image/png',
      },
    ],
  },

  // Enhanced Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@keyskeeper',
    creator: '@keyskeeper',
    title: 'Keyskeeper - Property & Room Rental Management | New Zealand',
    description: 'Professional property management across NZ. Room-by-room & whole-home rentals. AI-powered compliance & automated systems. Your keys keeper.',
    images: {
      url: 'https://www.keyskeeper.co.nz/keyskeeper.png',
      alt: 'Keyskeeper Property Management New Zealand',
    },
  },

  // Additional SEO enhancements
  applicationName: 'Keyskeeper',
  referrer: 'origin-when-cross-origin',
  category: 'Property Management',
  classification: 'Business',
  
  // App-specific metadata
  appleWebApp: {
    capable: true,
    title: 'Keyskeeper',
    statusBarStyle: 'default',
  },

  // Verification tags (add your actual verification codes)
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },

  // Other metadata
  other: {
    'geo.region': 'NZ',
    'geo.placename': 'New Zealand',
    'geo.position': '-41.2865;174.7762', // Wellington coordinates
    'ICBM': '-41.2865,174.7762',
    'business.contact_data.locality': 'Auckland',
    'business.contact_data.region': 'Auckland',
    'business.contact_data.country_name': 'New Zealand',
    'og:business:hours:mon': '09:00-17:00',
    'og:business:hours:tue': '09:00-17:00',
    'og:business:hours:wed': '09:00-17:00',
    'og:business:hours:thu': '09:00-17:00',
    'og:business:hours:fri': '09:00-17:00',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-NZ">
      <head>
        {/* Performance optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Viewport and mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#504746" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Keyskeeper" />
        
        {/* Enhanced favicon and icon set */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/keyskeeper.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Additional SEO meta tags */}
        <meta name="format-detection" content="telephone=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#504746" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Structured data for local business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Keyskeeper",
              "description": "Professional property and room rental management services across New Zealand",
              "url": "https://www.keyskeeper.co.nz",
              "logo": "https://www.keyskeeper.co.nz/keyskeeper.png",
              "image": "https://www.keyskeeper.co.nz/keyskeeper.png",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "NZ",
                "addressLocality": "Auckland",
                "addressRegion": "Auckland"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "-36.8485",
                "longitude": "174.7633"
              },
              "areaServed": [
                {
                  "@type": "City",
                  "name": "Auckland"
                },
                {
                  "@type": "City", 
                  "name": "Wellington"
                },
                {
                  "@type": "City",
                  "name": "Christchurch"
                }
              ],
              "serviceType": [
                "Property Management",
                "Room Rental Management", 
                "Rental Property Compliance",
                "Maintenance Management",
                "Tenant Screening"
              ],
              "priceRange": "$$",
              "openingHours": "Mo-Fr 09:00-17:00",
              "sameAs": [
                "https://www.facebook.com/keyskeeper",
                "https://www.linkedin.com/company/keyskeeper",
                "https://twitter.com/keyskeeper"
              ]
            })
          }}
        />
        
        {/* Organization structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Keyskeeper",
              "alternateName": "Keys Keeper",
              "url": "https://www.keyskeeper.co.nz",
              "logo": "https://www.keyskeeper.co.nz/keyskeeper.png",
              "description": "We are your Keys Keeper – professional property management services across New Zealand",
              "foundingDate": "2023",
              "founders": [{
                "@type": "Person",
                "name": "Keyskeeper Team"
              }],
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "NZ"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "areaServed": "NZ",
                "availableLanguage": "English"
              }
            })
          }}
        />
      </head>
      <body className="font-inter bg-white">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}