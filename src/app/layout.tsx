import './globals.css'
import { builder } from '@builder.io/react';

builder.init('1199fc9e321e43e1ab53708e9a0fc2f3');

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
