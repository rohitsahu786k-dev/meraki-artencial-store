const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "merakiartencialstore.com",
      },
      {
        protocol: "http",
        hostname: "merakiartencialstore.com",
      },
    ],
  },
};

export default nextConfig;
