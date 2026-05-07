import React from "react"
import { Metadata } from "next"
import ProductDetails from "../../../../shared/modules/product/product-details"

async function fetchProductDetails(slug: string) {
  // Use internal server URL for SSR, fallback to public URL
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://127.0.0.1:8080";
  
  try {
    // Applications use ID-based routing, not slugs
    if (/^[a-f0-9]{24}$/i.test(slug)) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(
        `${baseUrl}/api/products/${slug}`,
        { 
          cache: "no-store",
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("Failed to fetch application:", response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      return data.application || null;
    }
    
    // If not a valid MongoDB ID, return null
    console.error("Invalid application ID format:", slug);
    return null;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error("Request timed out fetching application details");
    } else if (error.cause?.code === 'ECONNREFUSED') {
      console.error("Connection refused - is the API server running at", baseUrl, "?");
    } else {
      console.error("Error fetching application details:", error.message || error);
    }
    return null;
  }
}

async function fetchSimilarApplications(category: string, currentApplicationId: string) {
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
    const applications = data.applications || [];

    // Filter by same category, excluding current application
    let similar = applications.filter(
      (app: any) => app.appCategory === category && app._id !== currentApplicationId
    );

    // If not enough applications in same category, add other applications
    if (similar.length < 5) {
      const otherApplications = applications.filter(
        (app: any) => app._id !== currentApplicationId && !similar.some((s: any) => s._id === app._id)
      );
      similar = [...similar, ...otherApplications].slice(0, 10);
    }

    return similar.slice(0, 10);
  } catch (error: any) {
    console.error("Error fetching similar applications:", error.message || error);
    return [];
  }
}

const BASE_URL = "https://vettcode.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const application = await fetchProductDetails(slug);

  const title = application?.appName
    ? `${application.appName} — VETTCODE Marketplace`
    : "Application | VETTCODE";
  const description = application?.shortDescription || application?.detailedDescription
    ? `${(application.shortDescription || application.detailedDescription).slice(0, 150)}... Get verified production-ready code on VETTCODE.`
    : "Discover verified, production-ready applications and codebases on VETTCODE — the marketplace for developers.";
  const image = application?.appIcon?.url || application?.screenshots?.[0]?.url || `${BASE_URL}/og-image.png`;
  const url = `${BASE_URL}/product/${slug}`;

  return {
    title,
    description,
    keywords: [
      application?.appName,
      application?.appCategory,
      "verified code",
      "production ready",
      "developer marketplace",
      "VETTCODE",
      ...(application?.technologyStack || []),
    ].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 800, height: 800, alt: application?.appName || "Application" }],
      url,
      type: "website",
      siteName: "VETTCODE",
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
  const applicationDetails = await fetchProductDetails(slug);

  const similarApplications = applicationDetails
    ? await fetchSimilarApplications(applicationDetails.appCategory, applicationDetails._id)
    : [];

  const applicationSchema = applicationDetails
    ? {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: applicationDetails.appName,
        description: applicationDetails.shortDescription || applicationDetails.detailedDescription,
        image: applicationDetails.screenshots?.map((img: any) => img.url) || [],
        applicationCategory: applicationDetails.appCategory,
        operatingSystem: applicationDetails.supportedPlatforms?.join(", ") || "Cross-platform",
        offers: {
          "@type": "Offer",
          url: `${BASE_URL}/product/${slug}`,
          priceCurrency: applicationDetails.currency || "USD",
          price: applicationDetails.price || 0,
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "Organization",
            name: "VETTCODE",
          },
        },
        aggregateRating: applicationDetails.rating ? {
          "@type": "AggregateRating",
          ratingValue: applicationDetails.rating,
          ratingCount: 1,
        } : undefined,
      }
    : null;

  return (
    <>
      {applicationSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationSchema) }}
        />
      )}
      <ProductDetails
        productDetails={applicationDetails}
        similarProducts={similarApplications}
      />
    </>
  );
};

export default Page