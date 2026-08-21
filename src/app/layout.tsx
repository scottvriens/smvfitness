import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMV Fitness",
  description: "Your training, nutrition, habits, and check-ins — all in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
