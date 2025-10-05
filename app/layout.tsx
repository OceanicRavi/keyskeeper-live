// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.keyskeeper.co.nz'),
  
  title: {
    default: 'Keyskeeper - #1 Property Management & Rental Platform in New Zealand',
    template: '%s | Keyskeeper NZ'
  },
  
  description: 'New Zealand\'s leading property management platform. Find rooms & properties in Auckland, Wellington, Christchurch. AI-powered compliance, automated rent payments, instant viewings. Trusted by 1000+ landlords & tenants.',
  
  keywords: [
    'property management New Zealand',
    'room rental NZ',
    'Auckland property rental',
    'Wellington accommodation',
    'Christchurch rentals',
    'affordable rooms for rent Auckland',
    'student accommodation Wellington',
    'flatshare Christchurch',
    'property management software NZ',
    'rental property compliance NZ',
    'automated rent collection New Zealand',
    'Ponsonby room rental',
    'Parnell apartment rent',
    'Mount Victoria flatshare',
    'Riccarton accommodation',
    'online rent payment NZ',
    'property inspection services',
    'tenant screening New Zealand',
    'healthy homes compliance',
    'tenancy agreement NZ',
    'Trade Me property alternative',
    'better than Ray White',
    'Barfoot Thompson alternative',
    'boarding house management',
    'HMO property management',
    'vacation rental management NZ',
    'Airbnb property management',
    'student housing NZ',
    'professional property managers'
  ].join(', '),

  authors: [{ 
    name: 'Keyskeeper Limited', 
    url: 'https://www.keyskeeper.co.nz/about' 
  }],
  
  creator: 'Keyskeeper',
  publisher: 'Keyskeeper Limited',
  
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: 'https://www.keyskeeper.co.nz',
    languages: {
      'en-NZ': 'https://www.keyskeeper.co.nz',
    },
  },

  openGraph: {
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.keyskeeper.co.nz',
    siteName: 'Keyskeeper - Property Management New Zealand',
    title: 'Keyskeeper - #1 Property & Room Rental Platform | New Zealand',
    description: 'Find your perfect room or manage properties across NZ. Auckland, Wellington, Christchurch. AI-powered compliance, instant viewings, automated payments. Join 1000+ happy users.',
    images: [
      {
        url: 'https://www.keyskeeper.co.nz/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Keyskeeper - New Zealand Property Management Platform',
        type: 'image/jpeg',
      },
      {
        url: 'https://www.keyskeeper.co.nz/keyskeeper.png',
        width: 600,
        height: 600,
        alt: 'Keyskeeper Logo',
        type: 'image/png',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@keyskeeper',
    creator: '@keyskeeper',
    title: 'Keyskeeper - Property & Room Rentals | New Zealand',
    description: 'Find rooms & properties across NZ. AI-powered management, instant bookings, automated payments. Auckland, Wellington, Christchurch.',
    images: ['https://www.keyskeeper.co.nz/og-image.jpg'],
  },

  applicationName: 'Keyskeeper',
  referrer: 'origin-when-cross-origin',
  category: 'Property Management',
  classification: 'Real Estate',
  
  appleWebApp: {
    capable: true,
    title: 'Keyskeeper',
    statusBarStyle: 'default',
  },

  verification: {
    google: 'your-google-site-verification',
    yandex: 'your-yandex-verification',
    other: {
      'facebook-domain-verification': 'your-facebook-verification',
    }
  },

  other: {
    'geo.region': 'NZ',
    'geo.placename': 'New Zealand',
    'geo.position': '-41.2865;174.7762',
    'ICBM': '-41.2865,174.7762',
    'coverage': 'New Zealand',
    'distribution': 'global',
    'rating': 'general',
    'revisit-after': '1 days',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ENHANCED: More comprehensive structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      // Organization with enhanced details
      {
        "@type": "Organization",
        "@id": "https://www.keyskeeper.co.nz/#organization",
        "name": "Keyskeeper",
        "legalName": "Keyskeeper Limited",
        "alternateName": ["Keys Keeper", "Keyskeeper NZ"],
        "url": "https://www.keyskeeper.co.nz",
        "logo": {
          "@type": "ImageObject",
          "@id": "https://www.keyskeeper.co.nz/#logo",
          "url": "https://www.keyskeeper.co.nz/keyskeeper.png",
          "contentUrl": "https://www.keyskeeper.co.nz/keyskeeper.png",
          "width": 600,
          "height": 600,
          "caption": "Keyskeeper Logo"
        },
        "image": {
          "@id": "https://www.keyskeeper.co.nz/#logo"
        },
        "description": "New Zealand's leading AI-powered property management and rental platform connecting landlords with tenants across Auckland, Wellington, and Christchurch",
        "foundingDate": "2023",
        "slogan": "Your trusted Keys Keeper for property management",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "NZ",
          "addressRegion": "Auckland"
        },
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+64-27-777-1486",
            "contactType": "customer service",
            "email": "admin@keyskeeper.co.nz",
            "areaServed": "NZ",
            "availableLanguage": ["en-NZ", "English"],
            "contactOption": "TollFree"
          },
          {
            "@type": "ContactPoint",
            "telephone": "+64-27-777-1486",
            "contactType": "sales",
            "email": "admin@keyskeeper.co.nz",
            "areaServed": "NZ",
            "availableLanguage": ["en-NZ", "English"]
          }
        ],
        "sameAs": [
          "https://www.facebook.com/keyskeeper",
          "https://www.linkedin.com/company/keyskeeper",
          "https://twitter.com/keyskeeper",
          "https://www.instagram.com/keyskeeper"
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "156",
          "bestRating": "5",
          "worstRating": "1"
        }
      },
      
      // Website with enhanced search capability
      {
        "@type": "WebSite",
        "@id": "https://www.keyskeeper.co.nz/#website",
        "url": "https://www.keyskeeper.co.nz",
        "name": "Keyskeeper",
        "description": "Property management and room rental platform in New Zealand",
        "publisher": {
          "@id": "https://www.keyskeeper.co.nz/#organization"
        },
        "inLanguage": "en-NZ",
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.keyskeeper.co.nz/search?location={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        ]
      },

      // WebPage - Homepage
      {
        "@type": "WebPage",
        "@id": "https://www.keyskeeper.co.nz/#webpage",
        "url": "https://www.keyskeeper.co.nz",
        "name": "Keyskeeper - #1 Property Management & Rental Platform in New Zealand",
        "description": "Find your perfect room or manage properties across NZ. AI-powered compliance, instant viewings, automated payments.",
        "isPartOf": {
          "@id": "https://www.keyskeeper.co.nz/#website"
        },
        "about": {
          "@id": "https://www.keyskeeper.co.nz/#organization"
        },
        "inLanguage": "en-NZ",
        "datePublished": "2023-01-01",
        "dateModified": "2025-10-05"
      },
      
      // Software Application
      {
        "@type": "SoftwareApplication",
        "name": "Keyskeeper",
        "applicationCategory": "BusinessApplication",
        "applicationSubCategory": "Property Management Software",
        "operatingSystem": "Web, iOS, Android",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "NZD",
          "description": "Free to search and book. Property management services available."
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "156"
        },
        "featureList": [
          "AI-powered property compliance",
          "Automated rent collection",
          "Instant property viewings",
          "Tenant screening",
          "Digital tenancy agreements",
          "Healthy Homes compliance tracking",
          "Online rent payments",
          "Property inspection scheduling"
        ]
      },
      
      // Local Business - Auckland (Primary)
      {
        "@type": ["RealEstateAgent", "LocalBusiness"],
        "@id": "https://www.keyskeeper.co.nz/#business-auckland",
        "name": "Keyskeeper Auckland",
        "image": "https://www.keyskeeper.co.nz/keyskeeper.png",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "NZ",
          "addressLocality": "Auckland",
          "addressRegion": "Auckland"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": -36.8485,
          "longitude": 174.7633
        },
        "url": "https://www.keyskeeper.co.nz",
        "telephone": "+64-27-777-1486",
        "email": "admin@keyskeeper.co.nz",
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "09:00",
            "closes": "17:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Saturday",
            "opens": "10:00",
            "closes": "14:00"
          }
        ],
        "serviceArea": [
          {
            "@type": "City",
            "name": "Auckland",
            "containedInPlace": {
              "@type": "Country",
              "name": "New Zealand"
            }
          },
          {
            "@type": "City",
            "name": "Wellington"
          },
          {
            "@type": "City",
            "name": "Christchurch"
          },
          {
            "@type": "City",
            "name": "Hamilton"
          },
          {
            "@type": "City",
            "name": "Tauranga"
          },
          {
            "@type": "City",
            "name": "Dunedin"
          }
        ],
        "hasMap": "https://maps.google.com/?q=Auckland,New+Zealand"
      },
      
      // Service offerings with detailed pricing
      {
        "@type": "Service",
        "@id": "https://www.keyskeeper.co.nz/#service",
        "serviceType": "Property Management Services",
        "provider": {
          "@id": "https://www.keyskeeper.co.nz/#organization"
        },
        "areaServed": {
          "@type": "Country",
          "name": "New Zealand"
        },
        "availableChannel": {
          "@type": "ServiceChannel",
          "serviceUrl": "https://www.keyskeeper.co.nz",
          "servicePhone": {
            "@type": "ContactPoint",
            "telephone": "+64-27-777-1486"
          }
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Property Management Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Room Rental Management",
                "description": "Individual room rental and flatshare management with tenant matching"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Full Property Management",
                "description": "Complete property management including tenant screening, rent collection, and maintenance coordination"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Healthy Homes Compliance",
                "description": "NZ Healthy Homes compliance management and inspection services"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Tenant Screening",
                "description": "Comprehensive tenant background checks and reference verification"
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Online Rent Collection",
                "description": "Automated online rent payment processing and tracking"
              }
            }
          ]
        }
      },
      
      // BreadcrumbList for site navigation
      {
        "@type": "BreadcrumbList",
        "@id": "https://www.keyskeeper.co.nz/#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.keyskeeper.co.nz"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Search Properties",
            "item": "https://www.keyskeeper.co.nz/search"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "For Landlords",
            "item": "https://www.keyskeeper.co.nz/landlord"
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": "For Tenants",
            "item": "https://www.keyskeeper.co.nz/tenant"
          }
        ]
      },
      
      // FAQPage with more questions
      {
        "@type": "FAQPage",
        "@id": "https://www.keyskeeper.co.nz/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How does Keyskeeper work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Keyskeeper is a comprehensive property management platform connecting landlords with tenants across New Zealand. Landlords can list properties, manage tenants, handle rent collection, and ensure compliance. Tenants can search for properties, book instant viewings, and pay rent securely online."
            }
          },
          {
            "@type": "Question",
            "name": "Is Keyskeeper available in my city?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Keyskeeper operates across all major New Zealand cities including Auckland, Wellington, Christchurch, Hamilton, Tauranga, Dunedin, and Palmerston North."
            }
          },
          {
            "@type": "Question",
            "name": "How much does Keyskeeper cost?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Searching and booking properties on Keyskeeper is free for tenants. For landlords, we offer competitive property management pricing. Contact us at admin@keyskeeper.co.nz or call +64-27-777-1486 for a customized quote."
            }
          },
          {
            "@type": "Question",
            "name": "Does Keyskeeper help with Healthy Homes compliance?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Keyskeeper provides AI-powered Healthy Homes compliance management, including automated inspections, compliance tracking, and documentation to ensure your property meets all NZ government standards."
            }
          },
          {
            "@type": "Question",
            "name": "Can I pay rent online through Keyskeeper?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Absolutely! Keyskeeper offers secure automated online rent payment processing, making it easy for tenants to pay rent and for landlords to receive payments on time."
            }
          },
          {
            "@type": "Question",
            "name": "How quickly can I view a property?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "With Keyskeeper's instant viewing feature, you can often schedule property viewings within 24-48 hours. Some properties offer same-day viewings depending on availability."
            }
          }
        ]
      }
    ]
  };

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
        
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#504746" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Keyskeeper" />
        
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/keyskeeper.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        <meta name="format-detection" content="telephone=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#504746" />
        
        {/* Enhanced Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
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