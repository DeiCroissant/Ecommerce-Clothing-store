import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { WishlistProvider } from "@/features/wishlist/context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "VyronFashion - Thời Trang Hiện Đại",
  description: "Khám phá xu hướng thời trang mới nhất với VyronFashion. Chất lượng cao, phong cách độc đáo.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} antialiased bg-zinc-50 text-zinc-800`}
      >
        <WishlistProvider>
          <Header />
          {children}
          <Footer />
        </WishlistProvider>
      </body>
    </html>
  );
}
