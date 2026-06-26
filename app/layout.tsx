import type {Metadata} from 'next';
import { Inter, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Titan Concierge - Autonomous Logistics',
  description: 'Elite autonomous concierge managing predictive maintenance for Lamborghini Aventador SVJ in Isan, Thailand.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorantGaramond.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="bg-[#050505] text-[#F5F2ED] antialiased">{children}</body>
    </html>
  );
}

