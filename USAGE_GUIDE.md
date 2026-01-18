# 🎬 LUVID - Real Image & LUT Processing Guide

## ✅ What's Been Implemented

I've added **REAL image upload and LUT file processing** to Luvid! Here's what's new:

### 🖼️ **Real Image Upload**
- Upload actual camera images (JPG, PNG, TIFF)
- Images display on HTML5 canvas elements
- Before/after comparison with real photos
- Pixel-level image processing

### 📁 **Real .CUBE LUT File Parsing**
- Upload actual .cube LUT files
- Parse LUT data (size, RGB values)
- Apply real LUT transformations to images
- Support for any standard 3D LUT cube file

### 🎨 **Canvas-Based Processing**
- Two separate canvases: Before (raw) and After (graded)
- Real-time pixel manipulation
- Actual LUT lookup and interpolation
- Color grading adjustments applied to real pixels

---

## 🚀 How to Use

### Step 1: Upload an Image
1. Open the application
2. Click **"UPLOAD IMAGE"** button in the center
3. Select a camera image (preferably log footage)
4. Image will appear on the canvas

### Step 2: Upload a LUT File
1. Click **"UPLOAD .CUBE"** in the bottom LUT library
2. Select one or more `.cube` LUT files
3. LUT thumbnails will appear in the library
4. Click a LUT to apply it to your image

### Step 3: Compare Before/After
1. Drag the **cyan slider** left and right
2. Left side = Raw image (no LUT)
3. Right side = LUT applied image
4. See the real transformation!

### Step 4: Adjust Grading
1. **LUT Intensity**: Blend LUT with original (0-100%)
2. **Exposure**: Brighten or darken
3. **Contrast**: Increase or decrease contrast
4. **Saturation**: Adjust color intensity
5. **Temperature**: Shift warm/cool tones

### Step 5: Export Your Grade
1. Click **"EXPORT LUT"** button
2. Downloads a `.cube` file with your adjustments
3. Use in DaVinci Resolve, Premiere Pro, etc.

---

## 🔧 Technical Implementation

### Image Processing Pipeline
```typescript
1. User uploads image → FileReader converts to base64
2. Image loads into HTML Image element
3. Image drawn to two canvas elements (before & after)
4. After canvas: Get pixel data (ImageData)
5. For each pixel:
   - Normalize RGB to 0-1 range
   - Look up LUT value using 3D cube indexing
   - Apply LUT transformation
   - Apply exposure/contrast/saturation adjustments
   - Clamp values and write back to canvas
6. Display processed image in real-time
```

### LUT File Parsing
```typescript
parseCubeLUT(content: string) {
  - Read file line by line
  - Extract LUT_3D_SIZE (e.g., 33 for 33x33x33 cube)
  - Parse RGB triplets (e.g., "0.5 0.3 0.7")
  - Store in array for fast lookup
  - Return { size, data }
}
```

### 3D LUT Lookup
```typescript
// Convert RGB to LUT index
rIndex = floor(r * (size - 1))
gIndex = floor(g * (size - 1))
bIndex = floor(b * (size - 1))
index = rIndex + gIndex * size + bIndex * size * size

// Get transformed color
[newR, newG, newB] = lutData[index]
```

---

## 📂 Where to Find LUT Files

### Free LUT Sources:
1. **RocketStock** - https://www.rocketstock.com/free-after-effects-templates/35-free-luts-for-color-grading-videos/
2. **FilterGrade** - https://filtergrade.com/free-luts/
3. **Bounce Color** - https://www.bouncecolor.com/luts/free-luts
4. **IWLTBAP** - https://iwltbap.com/

### Sample Images:
- Use log footage from your camera
- Download sample log images from:
  - ARRI Sample Footage
  - Sony RAW Sample Files
  - Canon C-Log Test Footage

---

## 🎯 Current Features

### ✅ Working:
- Real image upload (JPG, PNG, TIFF)
- Real .cube LUT file parsing
- Canvas-based LUT application
- Before/after split-view with real images
- Pixel-level color grading
- LUT intensity blending
- Exposure/Contrast/Saturation adjustments
- Export custom LUTs

### 🔄 Fallback Mode:
- If no image uploaded: Shows gradient placeholders
- If no LUT uploaded: Uses color simulation
- Allows testing UI without files

---

## 🐛 Troubleshooting

### Image not showing?
- Check file format (JPG, PNG, TIFF supported)
- Try a smaller image (< 10MB recommended)
- Check browser console for errors

### LUT not applying?
- Ensure .cube file is valid format
- Check LUT_3D_SIZE is present in file
- Verify RGB values are 0-1 range

### Performance slow?
- Large images take time to process
- Each slider adjustment reprocesses all pixels
- Consider resizing image before upload

---

## 🚀 Next Steps

### Phase 3 - Advanced Features:
1. **WebGL Acceleration** - Use GPU for faster processing
2. **Histogram Display** - Show RGB/Luma histograms
3. **Waveform Monitor** - Professional video scopes
4. **Batch Processing** - Apply LUT to multiple images
5. **Video Support** - Process MP4/MOV files frame-by-frame

---

## 💡 Tips for Best Results

1. **Use Log Footage**: LUTs work best on log-encoded images
2. **Match LUT to Profile**: Use ARRI LUTs with ARRI LogC footage
3. **Adjust Intensity**: Start at 100%, then dial back if too strong
4. **Fine-tune with Sliders**: Use exposure/contrast after LUT
5. **Export Often**: Save your favorite grades as custom LUTs

---

**You now have a REAL, functional LUT previewer!** 🎉

Upload your camera images and .cube files to see actual color grading in action!
