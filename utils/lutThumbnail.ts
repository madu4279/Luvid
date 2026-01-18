/**
 * Generate a color gradient thumbnail from LUT data
 * Creates a horizontal gradient bar showing the LUT's color transformation
 */

export function generateLUTThumbnail(lutData: { size: number; data: number[][] } | null): string {
    if (!lutData || !lutData.data || lutData.data.length === 0) {
        // Fallback gradient
        return 'linear-gradient(90deg, #000, #888, #fff)'
    }

    const size = lutData.size
    const samples = 10 // Number of color samples across the gradient
    const colors: string[] = []

    for (let i = 0; i < samples; i++) {
        // Sample colors evenly across the LUT
        const t = i / (samples - 1)

        // Use neutral gray as input (0.5, 0.5, 0.5) and vary across the range
        const r = t
        const g = 0.5
        const b = 0.5

        // Scale to LUT coordinates
        const rIndex = Math.floor(r * (size - 1))
        const gIndex = Math.floor(g * (size - 1))
        const bIndex = Math.floor(b * (size - 1))

        // Calculate 1D index
        const index = rIndex + gIndex * size + bIndex * size * size

        if (index >= 0 && index < lutData.data.length) {
            const [lutR, lutG, lutB] = lutData.data[index]

            // Convert to RGB 0-255
            const red = Math.round(lutR * 255)
            const green = Math.round(lutG * 255)
            const blue = Math.round(lutB * 255)

            colors.push(`rgb(${red}, ${green}, ${blue})`)
        }
    }

    // Create gradient string
    if (colors.length > 0) {
        return `linear-gradient(90deg, ${colors.join(', ')})`
    }

    return 'linear-gradient(90deg, #000, #888, #fff)'
}

/**
 * Generate thumbnail from LUT by sampling multiple points
 * Creates a more accurate representation of the LUT's color transformation
 */
export function generateAdvancedLUTThumbnail(lutData: { size: number; data: number[][] } | null): string {
    if (!lutData || !lutData.data || lutData.data.length === 0) {
        return 'linear-gradient(180deg, #1a1a1a, #4a4a4a, #7a7a7a)'
    }

    const size = lutData.size
    const samples = 8
    const colors: string[] = []

    // Sample across different luminance levels
    for (let i = 0; i < samples; i++) {
        const luma = i / (samples - 1)

        // Use neutral color at different brightness levels
        const r = luma
        const g = luma
        const b = luma

        const rIndex = Math.min(Math.floor(r * (size - 1)), size - 1)
        const gIndex = Math.min(Math.floor(g * (size - 1)), size - 1)
        const bIndex = Math.min(Math.floor(b * (size - 1)), size - 1)

        const index = rIndex + gIndex * size + bIndex * size * size

        if (index >= 0 && index < lutData.data.length) {
            const [lutR, lutG, lutB] = lutData.data[index]

            const red = Math.round(Math.max(0, Math.min(1, lutR)) * 255)
            const green = Math.round(Math.max(0, Math.min(1, lutG)) * 255)
            const blue = Math.round(Math.max(0, Math.min(1, lutB)) * 255)

            colors.push(`rgb(${red}, ${green}, ${blue})`)
        }
    }

    if (colors.length > 1) {
        return `linear-gradient(180deg, ${colors.join(', ')})`
    }

    return 'linear-gradient(180deg, #1a1a1a, #4a4a4a, #7a7a7a)'
}
