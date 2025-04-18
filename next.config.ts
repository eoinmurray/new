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
}
 
const withMDX = createMDX({
  options: {
    remarkPlugins: [['remark-math']],
    rehypePlugins: [['rehype-katex', { strict: true, throwOnError: true }]],
  },
})
 
// Merge MDX config with Next.js config
export default withMDX(nextConfig)