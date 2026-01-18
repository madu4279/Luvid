/**
 * LUT Parser and Processor Utilities
 * For Phase 2 Implementation
 */

export interface LUTData {
    title: string
    size: number
    data: number[][]
}

/**
 * Parse a .cube LUT file
 * @param fileContent - Raw text content of .cube file
 * @returns Parsed LUT data structure
 */
export function parseCubeLUT(fileContent: string): LUTData {
    const lines = fileContent.split('\n')
    let title = 'Untitled LUT'
    let size = 33 // Default 3D LUT size
    const data: number[][] = []

    lines.forEach(line => {
        const trimmed = line.trim()

        // Skip comments
        if (trimmed.startsWith('#')) return

        // Parse title
        if (trimmed.startsWith('TITLE')) {
            title = trimmed.replace(/TITLE\s+"?([^"]+)"?/, '$1')
        }

        // Parse LUT size
        if (trimmed.startsWith('LUT_3D_SIZE')) {
            size = parseInt(trimmed.split(/\s+/)[1])
        }

        // Parse RGB values
        if (trimmed.match(/^[\d.]+\s+[\d.]+\s+[\d.]+$/)) {
            const [r, g, b] = trimmed.split(/\s+/).map(Number)
            data.push([r, g, b])
        }
    })

    return { title, size, data }
}

/**
 * Apply LUT to RGB color
 * @param r - Red value (0-1)
 * @param g - Green value (0-1)
 * @param b - Blue value (0-1)
 * @param lut - Parsed LUT data
 * @returns Transformed RGB values
 */
export function applyLUT(
    r: number,
    g: number,
    b: number,
    lut: LUTData
): [number, number, number] {
    const { size, data } = lut

    // Scale input to LUT coordinates
    const rIndex = r * (size - 1)
    const gIndex = g * (size - 1)
    const bIndex = b * (size - 1)

    // Get integer and fractional parts
    const rFloor = Math.floor(rIndex)
    const gFloor = Math.floor(gIndex)
    const bFloor = Math.floor(bIndex)

    const rFrac = rIndex - rFloor
    const gFrac = gIndex - gFloor
    const bFrac = bIndex - bFloor

    // Trilinear interpolation (simplified for now)
    const index = rFloor + gFloor * size + bFloor * size * size

    if (index >= data.length) {
        return [r, g, b] // Return original if out of bounds
    }

    const [outR, outG, outB] = data[index]

    return [outR, outG, outB]
}

/**
 * Generate a .cube file from LUT data
 * @param lut - LUT data structure
 * @returns .cube file content as string
 */
export function generateCubeFile(lut: LUTData): string {
    let content = `TITLE "${lut.title}"\n`
    content += `LUT_3D_SIZE ${lut.size}\n\n`

    lut.data.forEach(([r, g, b]) => {
        content += `${r.toFixed(6)} ${g.toFixed(6)} ${b.toFixed(6)}\n`
    })

    return content
}

/**
 * Create an identity LUT (no color transformation)
 * @param size - LUT cube size (typically 33 or 64)
 * @returns Identity LUT data
 */
export function createIdentityLUT(size: number = 33): LUTData {
    const data: number[][] = []

    for (let b = 0; b < size; b++) {
        for (let g = 0; g < size; g++) {
            for (let r = 0; r < size; r++) {
                const rVal = r / (size - 1)
                const gVal = g / (size - 1)
                const bVal = b / (size - 1)
                data.push([rVal, gVal, bVal])
            }
        }
    }

    return {
        title: 'Identity LUT',
        size,
        data
    }
}

/**
 * Blend two LUTs with intensity
 * @param lut1 - First LUT (typically identity)
 * @param lut2 - Second LUT (the creative grade)
 * @param intensity - Blend factor (0-1)
 * @returns Blended LUT
 */
export function blendLUTs(
    lut1: LUTData,
    lut2: LUTData,
    intensity: number
): LUTData {
    if (lut1.size !== lut2.size) {
        throw new Error('LUT sizes must match')
    }

    const data: number[][] = []

    for (let i = 0; i < lut1.data.length; i++) {
        const [r1, g1, b1] = lut1.data[i]
        const [r2, g2, b2] = lut2.data[i]

        const r = r1 + (r2 - r1) * intensity
        const g = g1 + (g2 - g1) * intensity
        const b = b1 + (b2 - b1) * intensity

        data.push([r, g, b])
    }

    return {
        title: `${lut2.title} (${Math.round(intensity * 100)}%)`,
        size: lut1.size,
        data
    }
}

/**
 * Apply color grading adjustments to a LUT
 * @param lut - Input LUT
 * @param adjustments - Grading parameters
 * @returns Modified LUT
 */
export function applyGrading(
    lut: LUTData,
    adjustments: {
        exposure?: number    // -1 to 1
        contrast?: number    // -1 to 1
        saturation?: number  // -1 to 1
        temperature?: number // -1 to 1
    }
): LUTData {
    const {
        exposure = 0,
        contrast = 0,
        saturation = 0,
        temperature = 0
    } = adjustments

    const data: number[][] = []

    lut.data.forEach(([r, g, b]) => {
        let newR = r
        let newG = g
        let newB = b

        // Apply exposure
        if (exposure !== 0) {
            const factor = Math.pow(2, exposure)
            newR *= factor
            newG *= factor
            newB *= factor
        }

        // Apply contrast
        if (contrast !== 0) {
            const factor = contrast + 1
            newR = ((newR - 0.5) * factor) + 0.5
            newG = ((newG - 0.5) * factor) + 0.5
            newB = ((newB - 0.5) * factor) + 0.5
        }

        // Apply saturation
        if (saturation !== 0) {
            const gray = 0.2989 * newR + 0.5870 * newG + 0.1140 * newB
            const factor = saturation + 1
            newR = gray + (newR - gray) * factor
            newG = gray + (newG - gray) * factor
            newB = gray + (newB - gray) * factor
        }

        // Apply temperature
        if (temperature !== 0) {
            if (temperature > 0) {
                // Warm
                newR += temperature * 0.1
                newB -= temperature * 0.1
            } else {
                // Cool
                newR += temperature * 0.1
                newB -= temperature * 0.1
            }
        }

        // Clamp values
        newR = Math.max(0, Math.min(1, newR))
        newG = Math.max(0, Math.min(1, newG))
        newB = Math.max(0, Math.min(1, newB))

        data.push([newR, newG, newB])
    })

    return {
        ...lut,
        data
    }
}

/**
 * Download a LUT file
 * @param lut - LUT data to export
 * @param filename - Output filename (without extension)
 */
export function downloadLUT(lut: LUTData, filename: string): void {
    const content = generateCubeFile(lut)
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.cube`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
}
