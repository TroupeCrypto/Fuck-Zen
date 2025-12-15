import './globals.css';

export const metadata = {
  title: "Troupe War Room",
  description: "Tier 1 Executive Roundtable and Digital Headquarters"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
