import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  compiler: {
    relay: {
      src: './',
      artifactDirectory: './__generated__',
      language: 'typescript',
      eagerEsModules: false
    }
  },
  experimental: {
    // react compiler only enhances performance a little bit, but it will increase build time 30~40%, so disable until it is stable
    reactCompiler: false
  }
};

export default withNextIntl(nextConfig);
