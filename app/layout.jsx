import './globals.css';

export const metadata = {
  title: 'Valict - Mall Vision Management System',
  description: 'نظام إدارة وتتشغيل المولات الموحد بمدينة الفيوم الجديدة',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
