import type { Metadata } from 'next'

interface SEOParams {
  title?: string
  description?: string
  keywords?: string[]
  robots?: string
  openGraph?: Metadata['openGraph']
  twitter?: Metadata['twitter']
  authors?: Metadata['authors']
  applicationName?: string
  generator?: string
  category?: string
  referrer?: string
}

export function generateMetadata({
  title = 'Archination',
  description = 'Maintaining Universal Design of Homes',
  keywords = ['architecture', 'universal design', 'homes', 'archination'],
  robots = 'index, follow',
  openGraph,
  twitter,
  authors,
  applicationName = 'Archination',
  generator = 'Next.js',
  category,
}: SEOParams = {}): Metadata {
  return {
    title,
    description,
    keywords,
    robots,
    authors,
    applicationName,
    generator,
    category,
    // referrer,
    openGraph: {
      title,
      description,
      url: 'https://archination.io',
      siteName: 'Archination',
      locale: 'en_US',
      type: 'website',
      ...openGraph,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@archination',
      creator: '@archination',
      ...twitter,
    },
  }
}
