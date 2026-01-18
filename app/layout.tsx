import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Luvid | Cinematic LUT Previewer',
    description: 'Visualize. Customize. Export. - Professional LUT previewer for colorists.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
