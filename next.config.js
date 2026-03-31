/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'schooling-bucket1.s3.amazonaws.com', // Replace with your actual image domain
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com', // Replace with your actual image domain
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Replace with your actual image domain
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me', // Replace with your actual image domain
      },
      {
        protocol: 'https',
        hostname: 'www.w3schools.com', // Replace with your actual image domain
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com', // Replace with your actual image domain
      },
    ],
  },
}

module.exports = nextConfig
