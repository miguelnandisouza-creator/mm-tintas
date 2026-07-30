import { ImageResponse } from "next/og";

export const alt = "MM Tintas e Complementos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 15% 20%, #ead99d 0%, transparent 32%), #faf9f5",
        color: "#182333",
        padding: 80,
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          border: "2px solid #e4dfd2",
          borderRadius: 42,
          background: "rgba(255,255,255,.82)",
          padding: "64px 70px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
          <span
            style={{
              color: "#245aa5",
              fontSize: 25,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Tubarão · Santa Catarina
          </span>
          <span
            style={{
              marginTop: 18,
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: -4,
              lineHeight: 1,
            }}
          >
            MM Tintas e Complementos
          </span>
          <span style={{ marginTop: 24, color: "#607083", fontSize: 29 }}>
            A cor certa começa com a escolha certa.
          </span>
        </div>
        <div
          style={{
            display: "flex",
            width: 170,
            height: 170,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 50,
            background: "#245aa5",
            color: "white",
            fontSize: 54,
            fontWeight: 800,
          }}
        >
          MM
        </div>
      </div>
    </div>,
    size,
  );
}
