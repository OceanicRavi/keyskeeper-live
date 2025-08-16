import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Keyskeeper - Property & Room Rental Management | New Zealand',
  description: 'We are your Keys Keeper – we take care of your property. Room-by-room & whole-home property management built for NZ. AI-powered compliance, payments, and maintenance.',
  keywords: 'property rental, room rental, New Zealand, Auckland, Wellington, property management, rental properties, rooms for rent',
  authors: [{ name: 'Keyskeeper', url: 'https://www.keyskeeper.co.nz' }],
  creator: 'Keyskeeper',
  publisher: 'Keyskeeper',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_NZ',
    url: 'https://www.keyskeeper.co.nz',
    siteName: 'Keyskeeper',
    title: 'Keyskeeper - Property & Room Rental Management | New Zealand',
    description: 'We are your Keys Keeper – we take care of your property. Room-by-room & whole-home property management built for NZ.',
    images: [
      {
        url: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
        width: 1260,
        height: 750,
        alt: 'Keyskeeper Property Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Keyskeeper - Property & Room Rental Management | New Zealand',
    description: 'We are your Keys Keeper – we take care of your property. Room-by-room & whole-home property management built for NZ.',
    images: ['https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg'],
  },
  alternates: {
    canonical: 'https://www.keyskeeper.co.nz',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#FF5A5F" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="font-inter bg-white">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}