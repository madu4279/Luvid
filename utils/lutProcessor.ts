/**
 * Professional-grade 3D LUT Application with Trilinear Interpolation
 * Provides accurate, high-quality color grading without banding artifacts
 */

export interface LUTData {
    size: number
    data: number[][]
}

/**
 * Apply 3D LUT to RGB color using trilinear interpolation
 * This provides smooth, professional-quality color transformations
 * 
 * @param r - Red value (0-1)
 * @param g - Green value (0-1)
 * @param b - Blue value (0-1)
 * @param lutData - Parsed LUT data
 * @returns Transformed [R, G, B] values (0-1)
 */
export function applyLUTTrilinear(
    r: number,
    g: number,
    b: number,
    lutData: LUTData
): [number, number, number] {
    if (!lutData || !lutData.data || lutData.data.length === 0) {
        return [r, g, b]
    }

    const size = lutData.size

    // Scale input to LUT coordinates
    const rScaled = r * (size - 1)
    const gScaled = g * (size - 1)
    const bScaled = b * (size - 1)

    // Get integer parts (floor)
    const r0 = Math.floor(rScaled)
    const g0 = Math.floor(gScaled)
    const b0 = Math.floor(bScaled)

    // Get next indices (ceiling), clamped to size-1
    const r1 = Math.min(r0 + 1, size - 1)
    const g1 = Math.min(g0 + 1, size - 1)
    const b1 = Math.min(b0 + 1, size - 1)

    // Get fractional parts for interpolation
    const rFrac = rScaled - r0
    const gFrac = gScaled - g0
    const bFrac = bScaled - b0

    // Helper function to get LUT value at specific index
    const getLUTValue = (ri: number, gi: number, bi: number): number[] => {
        const index = ri + gi * size + bi * size * size
        if (index >= 0 && index < lutData.data.length) {
            return lutData.data[index]
        }
        return [r, g, b] // Fallback to original color
    }

    // Get 8 corner values for trilinear interpolation
    const c000 = getLUTValue(r0, g0, b0)
    const c001 = getLUTValue(r0, g0, b1)
    const c010 = getLUTValue(r0, g1, b0)
    const c011 = getLUTValue(r0, g1, b1)
    const c100 = getLUTValue(r1, g0, b0)
    const c101 = getLUTValue(r1, g0, b1)
    const c110 = getLUTValue(r1, g1, b0)
    const c111 = getLUTValue(r1, g1, b1)

    // Perform trilinear interpolation for each channel
    const result: [number, number, number] = [0, 0, 0]

    for (let channel = 0; channel < 3; channel++) {
        // Interpolate along R axis
        const c00 = c000[channel] * (1 - rFrac) + c100[channel] * rFrac
        const c01 = c001[channel] * (1 - rFrac) + c101[channel] * rFrac
        const c10 = c010[channel] * (1 - rFrac) + c110[channel] * rFrac
        const c11 = c011[channel] * (1 - rFrac) + c111[channel] * rFrac

        // Interpolate along G axis
        const c0 = c00 * (1 - gFrac) + c10 * gFrac
        const c1 = c01 * (1 - gFrac) + c11 * gFrac

        // Interpolate along B axis
        result[channel] = c0 * (1 - bFrac) + c1 * bFrac
    }

    return result
}

/**
 * Apply color grading adjustments to RGB values
 * 
 * @param r - Red value (0-1)
 * @param g - Green value (0-1)
 * @param b - Blue value (0-1)
 * @param adjustments - Grading parameters
 * @returns Adjusted [R, G, B] values (0-1)
 */
export function applyColorGrading(
    r: number,
    g: number,
    b: number,
    adjustments: {
        exposure?: number      // -50 to 50
        contrast?: number      // -50 to 50
        saturation?: number    // -50 to 50
        temperature?: number   // -50 to 50
    }
): [number, number, number] {
    const { exposure = 0, contrast = 0, saturation = 0, temperature = 0 } = adjustments

    // Apply temperature (warm/cool shift)
    if (temperature !== 0) {
        const tempFactor = temperature / 50
        // Warm = more red/yellow, Cool = more blue
        r += tempFactor * 0.1
        b -= tempFactor * 0.1
    }

    // Apply exposure (using proper photographic exposure formula)
    if (exposure !== 0) {
        const expFactor = Math.pow(2, exposure / 50)
        r *= expFactor
        g *= expFactor
        b *= expFactor
    }

    // Apply saturation (using Rec. 709 luma coefficients)
    if (saturation !== 0) {
        const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b
        const satFactor = 1 + (saturation / 50)
        r = gray + (r - gray) * satFactor
        g = gray + (g - gray) * satFactor
        b = gray + (b - gray) * satFactor
    }

    // Apply contrast
    if (contrast !== 0) {
        const contrastFactor = (100 + contrast) / 100
        r = ((r - 0.5) * contrastFactor) + 0.5
        g = ((g - 0.5) * contrastFactor) + 0.5
        b = ((b - 0.5) * contrastFactor) + 0.5
    }

    // Clamp to valid range
    r = Math.max(0, Math.min(1, r))
    g = Math.max(0, Math.min(1, g))
    b = Math.max(0, Math.min(1, b))

    return [r, g, b]
}

/**
 * Process entire image with LUT and color grading
 * Optimized for performance with proper rounding
 * 
 * @param imageData - Canvas ImageData object
 * @param lutData - Parsed LUT data (optional)
 * @param intensity - LUT blend intensity (0-100)
 * @param adjustments - Color grading adjustments
 */
export function processImageWithLUT(
    imageData: ImageData,
    lutData: LUTData | null,
    intensity: number,
    adjustments: {
        exposure?: number
        contrast?: number
        saturation?: number
        temperature?: number
    }
): void {
    const data = imageData.data
    const intensityFactor = intensity / 100

    for (let i = 0; i < data.length; i += 4) {
        // Normalize to 0-1 range
        let r = data[i] / 255
        let g = data[i + 1] / 255
        let b = data[i + 2] / 255

        // Apply LUT with trilinear interpolation
        if (lutData && lutData.data && lutData.data.length > 0) {
            const [lutR, lutG, lutB] = applyLUTTrilinear(r, g, b, lutData)

            // Blend with original based on intensity
            r = r + (lutR - r) * intensityFactor
            g = g + (lutG - g) * intensityFactor
            b = b + (lutB - b) * intensityFactor
        }

        // Apply color grading adjustments
        ;[r, g, b] = applyColorGrading(r, g, b, adjustments)

        // Convert back to 0-255 range with proper rounding
        data[i] = Math.round(r * 255)
        data[i + 1] = Math.round(g * 255)
        data[i + 2] = Math.round(b * 255)
        // Alpha channel (data[i + 3]) remains unchanged
    }
}
