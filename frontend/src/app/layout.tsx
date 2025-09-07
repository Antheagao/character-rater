import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { UserProvider } from "@/contexts/UserContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anime Character Rater",
  description: "Review and rate anime characters",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} flex min-h-screen flex-col font-sans antialiased`}
      >
        <UserProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
