import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/mdx-pages/:path*',
        // This routes requests from / to /mdx-pages internally
        // while keeping the URL in the browser as /
      },
    ]
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  turbopack: {
    // Your turbopack options if needed
  }
}
 
// Import plugins
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

const withMDX = createMDX({
  extension: /\.mdx?$/,
})
 
// Merge MDX config with Next.js config
export default withMDX(nextConfig)