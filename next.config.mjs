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
  async redirects() {
    return [
      {
        source: "/manage-wp",
        destination: `${(process.env.NEXT_PUBLIC_WP_URL || "https://merakiartencialstore.com").replace(/\/$/, "")}/wp-login.php`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
