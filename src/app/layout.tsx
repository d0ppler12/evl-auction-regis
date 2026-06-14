import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: "Eternia Volleyball League",
  description: "One of the best leagues in Eternia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${rajdhani.className} min-h-screen bg-slate-900 text-slate-50 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
