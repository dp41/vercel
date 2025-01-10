import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

//font family
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Airex Rail Cargo",
  description: "A Complete Logistic Solution by Air, Rail & Road",
  icons: {
    icon: "/Images/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
    <head>
      <link rel="icon" href="/Images/logo.png" />
        <title>Airex Rail Cargo</title>
    </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
