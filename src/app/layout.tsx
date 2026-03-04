import type { Metadata } from "next";
import { Outfit, JetBrains_Mono, Paytone_One } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const paytoneOne = Paytone_One({
  variable: "--font-bubblegum",
  subsets: ["latin"],
  weight: ["400"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "kwek — Flashcards & Quizzes",
  description: "Study smarter with kwek: flashcards and multiple-choice quizzes for interview prep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${jetbrainsMono.variable} ${paytoneOne.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
