import { MetadataRoute } from "next";

const BASE_URL = "https://eshopug.vercel.app";
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

async function fetchProducts() {
  try {
    const res = await fetch(`${SERVER_URL}/api/products?limit=500`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

async function fetchShops() {
  try {
    const res = await fetch(`${SERVER_URL}/api/shops?limit=200`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.shops || [];
  } catch {
    return [];
  }
}

async function fetchEvents() {
  try {
    const res = await fetch(`${SERVER_URL}/api/events?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.events || [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, shops, events] = await Promise.all([
    fetchProducts(),
    fetchShops(),
    fetchEvents(),
  ]);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/shops`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/become-seller`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    // Category pages
    {
      url: `${BASE_URL}/products?category=electronics`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/products?category=fashion`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/products?category=home`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/products?category=beauty`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/products?category=sports`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/products?category=books`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/products?category=toys`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/products?category=groceries`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // Dynamic product pages
  const productPages: MetadataRoute.Sitemap = products
    .filter((p: any) => p.slug)
    .map((product: any) => ({
      url: `${BASE_URL}/product/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: "daily" as const,
      priority: 0.85,
    }));

  // Dynamic shop pages
  const shopPages: MetadataRoute.Sitemap = shops
    .filter((s: any) => s.id || s._id)
    .map((shop: any) => ({
      url: `${BASE_URL}/shop/${shop.id || shop._id}`,
      lastModified: shop.updatedAt ? new Date(shop.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  // Dynamic event pages
  const eventPages: MetadataRoute.Sitemap = events
    .filter((e: any) => e.slug || e.id)
    .map((event: any) => ({
      url: `${BASE_URL}/events/${event.slug || event.id}`,
      lastModified: event.updatedAt ? new Date(event.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  return [...staticPages, ...productPages, ...shopPages, ...eventPages];
}
