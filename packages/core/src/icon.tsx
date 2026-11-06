import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";

type Variant = "blog" | "admin";

const styles: Record<Variant, { backgroundImage?: string; backgroundColor: string; color: string; border?: string }> = {
  blog: { backgroundImage: "linear-gradient(135deg, #08F8B8, #0A8F6C)", backgroundColor: "#08F8B8", color: "#0F1A16" },
  admin: { backgroundColor: "#13111C", color: "#08F8B8", border: "#08F8B8" },
};

let poppinsBold: Promise<Buffer> | undefined;

function loadFont() {
  poppinsBold ??= readFile(new URL("../assets/poppins-700.woff", import.meta.url));
  return poppinsBold;
}

export async function brandIcon(variant: Variant, px: number, rounded = true) {
  const s = styles[variant];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: s.backgroundColor,
          ...(s.backgroundImage ? { backgroundImage: s.backgroundImage } : {}),
          color: s.color,
          borderRadius: rounded ? px * 0.22 : 0,
          ...(s.border ? { border: `${Math.max(1, Math.round(px / 16))}px solid ${s.border}` } : {}),
          fontSize: px * 0.46,
          fontWeight: 700,
          letterSpacing: -px * 0.02,
          fontFamily: "Poppins",
        }}
      >
        AR
      </div>
    ),
    { width: px, height: px, fonts: [{ name: "Poppins", data: await loadFont(), weight: 700, style: "normal" }] },
  );
}
