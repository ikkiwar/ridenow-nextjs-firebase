import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RideNow | Tu servicio de transporte",
  description: "Conectamos pasajeros con conductores de forma rápida y segura",
  icons: {
    icon: "/ridenow_icon.png",
    shortcut: "/ridenow_icon.png",
    apple: "/ridenow_icon.png",
    other: {
      rel: "apple-touch-icon",
      url: "/ridenow_icon.png",
    },
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ backgroundColor: "#3B82F6" }} // Fondo azul para evitar flash blanco
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
