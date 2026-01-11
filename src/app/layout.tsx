import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "@/components/Sidebar/Sidebar";

export const metadata = {
  title: "JokesWeb Next",
  description: "A jokes website migrated to Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <Navbar />
          <Sidebar />
          <main style={{ padding: "2rem", minHeight: "calc(100vh - 80px)" }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
