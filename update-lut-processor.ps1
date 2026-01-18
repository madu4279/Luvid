$filePath = "f:\Luvid_02\app\page.tsx"
$content = Get-Content $filePath -Raw

# Define the old code block to replace
$oldCode = @'
                const data = imageData.data

                const lut = allLUTs.find(l => l.id === selectedLUT)
                const lutData = lut?.parsedData || parsedLUTData

                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i] / 255
                    let g = data[i + 1] / 255
                    let b = data[i + 2] / 255

                    // Apply LUT if available
                    if (lutData && lutData.data && lutData.data.length > 0) {
                        const size = lutData.size
                        const rIndex = Math.floor(r * (size - 1))
                        const gIndex = Math.floor(g * (size - 1))
                        const bIndex = Math.floor(b * (size - 1))
                        const index = rIndex + gIndex * size + bIndex * size * size

                        if (index < lutData.data.length) {
                            const [lutR, lutG, lutB] = lutData.data[index]
                            // Blend with intensity
                            r = r + (lutR - r) * (lutIntensity / 100)
                            g = g + (lutG - g) * (lutIntensity / 100)
                            b = b + (lutB - b) * (lutIntensity / 100)
                        }
                    } else if (lut?.colors) {
                        // Fallback to color simulation
                        const baseH = lut.colors.h + (temperature * 0.5)
                        const baseS = Math.max(0, Math.min(100, lut.colors.s + saturation))
                        const baseL = Math.max(10, Math.min(90, lut.colors.l + (exposure * 0.4)))
                        
                        // Simple color shift (not a real LUT, just for demo)
                        const factor = lutIntensity / 100
                        r = r + ((baseH / 360) - r) * factor * 0.1
                        g = g + ((baseS / 100) - g) * factor * 0.1
                        b = b + ((baseL / 100) - b) * factor * 0.1
                    }

                    // Apply exposure
                    const expFactor = Math.pow(2, exposure / 50)
                    r *= expFactor
                    g *= expFactor
                    b *= expFactor

                    // Apply saturation
                    const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b
                    const satFactor = 1 + (saturation / 50)
                    r = gray + (r - gray) * satFactor
                    g = gray + (g - gray) * satFactor
                    b = gray + (b - gray) * satFactor

                    // Apply contrast
                    const contrastFactor = (100 + contrast) / 100
                    r = ((r - 0.5) * contrastFactor) + 0.5
                    g = ((g - 0.5) * contrastFactor) + 0.5
                    b = ((b - 0.5) * contrastFactor) + 0.5

                    // Clamp and write back
                    data[i] = Math.max(0, Math.min(255, r * 255))
                    data[i + 1] = Math.max(0, Math.min(255, g * 255))
                    data[i + 2] = Math.max(0, Math.min(255, b * 255))
                }

                afterCtx.putImageData(imageData, 0, 0)
'@

# Define the new code
$newCode = @'
                const lut = allLUTs.find(l => l.id === selectedLUT)
                const lutData = lut?.parsedData || parsedLUTData

                // Professional LUT processor with trilinear interpolation
                processImageWithLUT(
                    imageData,
                    lutData,
                    lutIntensity,
                    {
                        exposure,
                        contrast,
                        saturation
                    }
                )

                afterCtx.putImageData(imageData, 0, 0)
'@

# Replace the code
$newContent = $content -replace [regex]::Escape($oldCode), $newCode

# Save the file
Set-Content -Path $filePath -Value $newContent -NoNewline

Write-Host "✅ File updated successfully!" -ForegroundColor Green
Write-Host "The professional LUT processor is now active." -ForegroundColor Cyan
Write-Host "Refresh your browser to see the quality improvement!" -ForegroundColor Yellow
