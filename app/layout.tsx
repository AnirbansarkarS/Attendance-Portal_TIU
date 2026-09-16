import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Attendance Portal",
  description:
    "Smart Attendance and Academic Management System"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">

      <body>
        {children}
      </body>

    </html>
  );
}