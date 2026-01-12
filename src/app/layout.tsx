import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar/Navbar";

export const metadata = {
  title: "JokesWeb Next",
  description: "A jokes website migrated to Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Añadimos suppressHydrationWarning aquí y en el body
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2rem",
            minHeight: "calc(100vh - 80px)"
          }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}