import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Animation DNA Lab",
  description:
    "Transform your image prompts into 1980s animation DNA with trope-driven remixing."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
