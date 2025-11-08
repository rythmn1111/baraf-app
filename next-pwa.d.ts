declare module 'next-pwa' {
  import { NextConfig } from 'next';

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    scope?: string;
    sw?: string;
    runtimeCaching?: any[];
    publicExcludes?: string[];
    buildExcludes?: (string | RegExp)[];
    cacheOnFrontEndNav?: boolean;
    dynamicStartUrl?: boolean;
    reloadOnOnline?: boolean;
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;

  export default withPWA;
}
