import { NextRequest, NextResponse } from "next/server";

/**
 * Web Vitals Analytics API Route
 * Receives and processes Core Web Vitals metrics from the client
 *
 * @see https://web.dev/vitals/
 */

// Interface for Web Vitals metric
interface WebVitalsMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta?: number;
  id: string;
  navigationType?: string;
  url: string;
  timestamp: number;
  userAgent: string;
}

// In-memory store for development (use proper database in production)
const metricsStore: WebVitalsMetric[] = [];
const MAX_STORE_SIZE = 1000;

/**
 * POST handler for Web Vitals metrics
 */
export async function POST(request: NextRequest) {
  try {
    const metric: WebVitalsMetric = await request.json();

    // Validate required fields
    if (!metric.name || typeof metric.value !== "number") {
      return NextResponse.json(
        { error: "Invalid metric data" },
        { status: 400 }
      );
    }

    // Add server timestamp
    const enrichedMetric = {
      ...metric,
      serverTimestamp: Date.now(),
    };

    // Store metric (in production, send to analytics service)
    if (process.env.NODE_ENV === "development") {
      // Keep only recent metrics in development
      metricsStore.push(enrichedMetric as WebVitalsMetric);
      if (metricsStore.length > MAX_STORE_SIZE) {
        metricsStore.shift();
      }
    } else {
      // In production, send to your analytics service
      // Examples: Google Analytics 4, Vercel Analytics, Datadog, etc.
      await sendToAnalyticsService(enrichedMetric);
    }

    // Log poor metrics for debugging
    if (metric.rating === "poor") {
      console.warn(
        `[Web Vitals] Poor ${metric.name}: ${metric.value.toFixed(2)} at ${metric.url}`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing Web Vitals metric:", error);
    return NextResponse.json(
      { error: "Failed to process metric" },
      { status: 500 }
    );
  }
}

/**
 * GET handler to retrieve metrics (development only)
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 }
    );
  }

  // Calculate statistics
  const stats = calculateStats(metricsStore);

  return NextResponse.json({
    metrics: metricsStore.slice(-100), // Return last 100 metrics
    stats,
  });
}

/**
 * Send metrics to external analytics service
 * Configure this based on your analytics provider
 */
async function sendToAnalyticsService(metric: Record<string, unknown>) {
  // Google Analytics 4 example
  if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    try {
      await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}&api_secret=${process.env.GA_API_SECRET}`,
        {
          method: "POST",
          body: JSON.stringify({
            client_id: metric.id,
            events: [
              {
                name: `web_vitals_${metric.name}`,
                params: {
                  value: metric.value,
                  rating: metric.rating,
                  page_location: metric.url,
                },
              },
            ],
          }),
        }
      );
    } catch (error) {
      console.error("Failed to send to GA4:", error);
    }
  }

  // Vercel Analytics example
  if (process.env.VERCEL_ANALYTICS_ID) {
    // Vercel Analytics is automatically tracked
  }

  // Custom analytics endpoint
  if (process.env.ANALYTICS_ENDPOINT) {
    try {
      await fetch(process.env.ANALYTICS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      console.error("Failed to send to custom analytics:", error);
    }
  }
}

/**
 * Calculate statistics from metrics
 */
function calculateStats(metrics: WebVitalsMetric[]) {
  const stats: Record<
    string,
    {
      count: number;
      avg: number;
      min: number;
      max: number;
      good: number;
      needsImprovement: number;
      poor: number;
    }
  > = {};

  metrics.forEach((metric) => {
    if (!stats[metric.name]) {
      stats[metric.name] = {
        count: 0,
        avg: 0,
        min: Infinity,
        max: -Infinity,
        good: 0,
        needsImprovement: 0,
        poor: 0,
      };
    }

    const s = stats[metric.name];
    s.count++;
    s.avg = (s.avg * (s.count - 1) + metric.value) / s.count;
    s.min = Math.min(s.min, metric.value);
    s.max = Math.max(s.max, metric.value);

    if (metric.rating === "good") s.good++;
    else if (metric.rating === "needs-improvement") s.needsImprovement++;
    else if (metric.rating === "poor") s.poor++;
  });

  return stats;
}

// Disable body parsing for this route
export const runtime = "edge";
