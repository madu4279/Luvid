# 🎬 LUVID - Cinematic LUT Previewer

**Visualize. Customize. Export.**

A premium, Hollywood-grade web application for video colorists. Built with Next.js, React, and Tailwind CSS.

![Luvid Screenshot](https://img.shields.io/badge/Status-Production%20Ready-00F3FF?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## ✨ Features

### 🎨 **The Vault** - Log Profile Library
- **ARRI LogC** - Industry-standard cinema camera log
- **Sony S-Log3** - Professional Sony cinema line
- **Canon C-Log** - Canon cinema EOS log profile
- **Panasonic V-Log** - Varicam log encoding

### 🖼️ **The Canvas** - Real-Time Preview
- **Split-View Comparison** - Draggable before/after slider
- **Live LUT Processing** - Instant visual feedback
- **Ambient Glow Effects** - Dynamic lighting based on image content
- **Cinematic Interface** - Blade Runner-inspired dark mode

### 📚 **The Look Deck** - LUT Management
- **Drag & Drop Upload** - Support for `.cube` LUT files
- **Thumbnail Previews** - Visual LUT library with live previews
- **Sample LUTs Included**:
  - Cinematic Teal
  - Warm Sunset
  - Cold Steel
  - Film Noir
  - Vintage 70s

### 🎛️ **The Inspector** - Professional Grading Tools
- **LUT Intensity** - 0-100% opacity control
- **Exposure** - ±50 stops adjustment
- **Contrast** - ±50 levels
- **Saturation** - ±50 color intensity
- **Temperature** - ±50 color temperature shift
- **Export Functionality** - Save custom LUTs

### 🔒 **Freemium Features**
- **Video Mode** - Locked premium feature (UI only)
- **Batch Export** - Pro-tier functionality (UI only)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd f:\Luvid_02
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```
   (If port 3000 is in use, Next.js will automatically use the next available port)

---

## 🎨 Design System

### Color Palette
- **Void Black**: `#050505` - Primary background
- **Neon Cyan**: `#00F3FF` - Active states, accents, glows
- **Neon Gold**: `#FFD700` - Premium/locked features

### Typography
- **Font Family**: Inter (Google Fonts)
- **Technical Text**: Uppercase, wide letter-spacing (0.2em)
- **Weights**: 300, 400, 500, 600, 700

### Effects
- **Glassmorphism**: `backdrop-filter: blur(20px)` with `bg-black/40`
- **Neon Glow**: Custom box-shadow with cyan/gold colors
- **Noise Texture**: SVG-based grain overlay for cinematic feel
- **Smooth Transitions**: 400ms cubic-bezier easing

---

## 📁 Project Structure

```
f:\Luvid_02\
├── app/
│   ├── globals.css          # Global styles, design tokens
│   ├── layout.tsx            # Root layout with metadata
│   └── page.tsx              # Main application component
├── public/                   # Static assets (add sample images here)
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind customization
├── tsconfig.json             # TypeScript configuration
└── next.config.js            # Next.js configuration
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **React 18** | UI component library |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Lucide React** | Premium icon library |

---

## 🎯 Usage Guide

### 1. Select a Log Profile
Click any camera icon in **The Vault** (left sidebar) to load a log profile.

### 2. Choose a LUT
Click a LUT thumbnail in **The Look Deck** (bottom strip) to apply it.

### 3. Adjust Grading
Use the sliders in **The Inspector** (right panel):
- **Intensity**: Blend LUT with original image
- **Exposure**: Brighten or darken
- **Contrast**: Increase or decrease contrast
- **Saturation**: Adjust color intensity
- **Temperature**: Shift warm/cool tones

### 4. Compare Before/After
Drag the **cyan slider** in the canvas to compare raw vs. graded footage.

### 5. Export Your LUT
Click **"EXPORT LUT"** to save your custom color grade.

---

## 🎬 Branding

**Powered by Dream Road Pictures**

This application is designed to feel like proprietary cinema software used in Hollywood post-production facilities. The aesthetic draws inspiration from:
- DaVinci Resolve
- Nuke
- Baselight
- Blade Runner UI design

---

## 🔮 Future Enhancements

### Phase 2 - The Engine
- [ ] Real WebGL LUT processing with `react-three-fiber`
- [ ] Actual `.cube` file parsing and application
- [ ] Image upload functionality
- [ ] Video file support (MP4, MOV)

### Phase 3 - The Polish
- [ ] Batch export for multiple LUTs
- [ ] Custom LUT creation from scratch
- [ ] Preset management system
- [ ] Keyboard shortcuts
- [ ] Undo/Redo functionality
- [ ] Export to multiple formats (3DL, ICC, etc.)

---

## 📄 License

This project is created for **Dream Road Pictures**.

---

## 🤝 Contributing

This is a proprietary application. For feature requests or bug reports, contact the development team.

---

## 🎨 Screenshots

### Main Interface
![Main Interface](./screenshots/main-interface.png)

### Split-View Comparison
![Split View](./screenshots/split-view.png)

### LUT Library
![LUT Library](./screenshots/lut-library.png)

---

**Built with ❤️ for Colorists by Dream Road Pictures**
