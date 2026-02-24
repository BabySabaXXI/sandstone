import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

/**
 * Open Graph Image Generation Route
 * Dynamically generates OG images for pages
 *
 * Usage: /og?title=Page%20Title&description=Page%20Description
 */

export const runtime = "edge";

// Font loading for OG images
const interBold = fetch(
  new URL("https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_EeA.woff2", import.meta.url)
).then((res) => res.arrayBuffer());

const interRegular = fetch(
  new URL("https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff2", import.meta.url)
).then((res) => res.arrayBuffer());

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const title = searchParams.get("title") || "Sandstone";
    const description =
      searchParams.get("description") ||
      "AI-Powered A-Level Learning Platform";
    const type = searchParams.get("type") || "default";

    // Load fonts
    const [interBoldData, interRegularData] = await Promise.all([
      interBold,
      interRegular,
    ]);

    // Generate OG image
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #F5F1EB 0%, #E8D5C4 100%)",
            padding: "60px",
            position: "relative",
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage:
                "radial-gradient(circle at 20% 80%, rgba(232, 213, 196, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 241, 235, 0.5) 0%, transparent 50%)",
            }}
          />

          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 32px rgba(245, 158, 11, 0.3)",
              }}
            >
              <span
                style={{
                  fontSize: "48px",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                S
              </span>
            </div>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: "#1A1A1A",
              textAlign: "center",
              marginBottom: "24px",
              lineHeight: 1.2,
              maxWidth: "900px",
              fontFamily: "Inter",
            }}
          >
            {title}
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: "32px",
              color: "#4B5563",
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: 1.5,
              fontFamily: "Inter",
            }}
          >
            {description}
          </p>

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                color: "#6B7280",
                fontFamily: "Inter",
              }}
            >
              sandstone.app
            </span>
          </div>

          {/* Badge */}
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: "40px",
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              padding: "12px 24px",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "white",
              }}
            />
            <span
              style={{
                fontSize: "20px",
                color: "white",
                fontWeight: "600",
                fontFamily: "Inter",
              }}
            >
              AI-Powered
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: interBoldData,
            style: "normal",
            weight: 700,
          },
          {
            name: "Inter",
            data: interRegularData,
            style: "normal",
            weight: 400,
          },
        ],
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
