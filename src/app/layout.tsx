import type { Metadata } from 'next';
import { Inter, Calistoga } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: [ 'latin' ], variable: '--font-sans' });
const calistoga = Calistoga({ weight: '400', subsets: [ 'latin' ], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Boedor - Food Delivery App',
  description: 'A role-based food delivery management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`${inter.variable} ${calistoga.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
