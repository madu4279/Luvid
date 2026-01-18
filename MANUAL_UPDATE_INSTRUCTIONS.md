# MANUAL UPDATE INSTRUCTIONS FOR page.tsx

## Location: f:\Luvid_02\app\page.tsx
## Lines to Replace: 245-308

### FIND THIS BLOCK (starting at line 245):
```
                const data = imageData.data

                const lut = allLUTs.find(l => l.id === selectedLUT)
                const lutData = lut?.parsedData || parsedLUTData

                for (let i = 0; i < data.length; i += 4) {
```

### REPLACE WITH:
```
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
```

### DELETE EVERYTHING from line 250 to line 307 (the entire for loop)

### KEEP line 308:
```
                afterCtx.putImageData(imageData, 0, 0)
```

---

## RESULT:
The section should look like this:

```typescript
            // Apply LUT to after canvas if selected
            if (selectedLUT) {
                const imageData = afterCtx.getImageData(0, 0, afterCanvas.width, afterCanvas.height)
                
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
            }
```

Save the file and the dev server will auto-reload with professional quality!
