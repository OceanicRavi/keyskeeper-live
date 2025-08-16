// Google Maps integration - will be enabled when API key is added
// import { Loader } from '@googlemaps/js-api-loader'

// let googleMapsPromise: Promise<typeof google> | null = null

// export const loadGoogleMaps = (): Promise<typeof google> => {
//   if (!googleMapsPromise) {
//     const loader = new Loader({
//       apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
//       version: 'weekly',
//       libraries: ['places', 'geometry'],
//     })

//     googleMapsPromise = loader.load()
//   }

//   return googleMapsPromise
// }

// Mock function for development
export const loadGoogleMaps = (): Promise<any> => {
  return Promise.resolve(null)
}

export interface Location {
  lat: number
  lng: number
}

export interface PlaceResult {
  name: string
  address: string
  location: Location
  suburb?: string
  city?: string
}