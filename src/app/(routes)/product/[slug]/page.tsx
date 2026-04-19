import React from "react"
import { Metadata } from "next"
import ProductDetails from "../../../../shared/modules/product/product-details"

async function fetchProductDetails(slug: string) {
  // Use internal server URL for SSR, fallback to public URL
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://127.0.0.1:8080";
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(
      `${baseUrl}/api/products?slug=${slug}`,
      { 
        cache: "no-store",
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("Failed to fetch product:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    // API returns array; find by slug
    const products = data.products || [];
    return products.find((p: any) => p.slug === slug) || null;
  } catch (error: any) {
    // Log more details about the error
    if (error.name === 'AbortError') {
      console.error("Request timed out fetching product details");
    } else if (error.cause?.code === 'ECONNREFUSED') {
      console.error("Connection refused - is the API server running at", baseUrl, "?");
    } else {
      console.error("Error fetching product details:", error.message || error);
    }
    return null;
  }
}

async function fetchSimilarProducts(category: string, currentProductId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://127.0.0.1:8080";
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(
      `${baseUrl}/api/products?category=${encodeURIComponent(category)}&limit=12`,
      { 
        cache: "no-store",
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const products = data.products || [];

    // Filter by same category, excluding current product
    let similar = products.filter(
      (p: any) => p.category === category && p.id !== currentProductId
    );

    // If not enough products in same category, add other products
    if (similar.length < 5) {
      const otherProducts = products.filter(
        (p: any) => p.id !== currentProductId && !similar.some((s: any) => s.id === p.id)
      );
      similar = [...similar, ...otherProducts].slice(0, 10);
    }

    return similar.slice(0, 10);
  } catch (error: any) {
    console.error("Error fetching similar products:", error.message || error);
    return [];
  }
}

const BASE_URL = "https://eshopug.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductDetails(slug);

  const title = product?.title
    ? `${product.title} — Buy Online in Uganda`
    : "Product | EshopUG Uganda";
  const description = product?.description
    ? `${product.description.slice(0, 150)}... Buy now on EshopUG — Uganda's #1 online marketplace.`
    : "Discover high quality products at the best prices on EshopUG — Uganda's leading online marketplace.";
  const image = product?.images?.[0]?.url || `${BASE_URL}/og-image.png`;
  const url = `${BASE_URL}/product/${slug}`;

  return {
    title,
    description,
    keywords: [
      product?.title,
      product?.category,
      "buy online Uganda",
      "Uganda marketplace",
      "online shopping Uganda",
      product?.brand,
    ].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 800, height: 800, alt: product?.title || "Product" }],
      url,
      type: "website",
      siteName: "EshopUG",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };
}

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const productDetails = await fetchProductDetails(slug);

  const similarProducts = productDetails
    ? await fetchSimilarProducts(productDetails.category, productDetails.id)
    : [];

  const productSchema = productDetails
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: productDetails.title,
        description: productDetails.description,
        image: productDetails.images?.map((img: any) => img.url) || [],
        sku: productDetails.id,
        brand: productDetails.brand
          ? { "@type": "Brand", name: productDetails.brand }
          : undefined,
        offers: {
          "@type": "Offer",
          url: `${BASE_URL}/product/${slug}`,
          priceCurrency: productDetails.currency || "UGX",
          price: productDetails.price,
          availability: productDetails.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          seller: {
            "@type": "Organization",
            name: "EshopUG",
          },
        },
      }
    : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <ProductDetails
        productDetails={productDetails}
        similarProducts={similarProducts}
      />
    </>
  );
};

export default Page