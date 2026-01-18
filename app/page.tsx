'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import {
    Film,
    Upload,
    Lock,
    Download,
    Sun,
    Contrast,
    Droplets,
    Thermometer,
    Play,
    Layers,
    RotateCcw,
    X
} from 'lucide-react'
import { processImageWithLUT } from '@/utils/lutProcessor'
import { generateAdvancedLUTThumbnail } from '@/utils/lutThumbnail'

// Log Profile Types
const LOG_PROFILES = [
    { id: 'arri', name: 'ARRI LogC', icon: '🎬', image: '/samples/arri-log.jpg' },
    { id: 'sony', name: 'Sony S-Log3', icon: '📹', image: '/samples/sony-log.jpg' },
    { id: 'canon', name: 'Canon C-Log', icon: '🎥', image: '/samples/canon-log.jpg' },
    { id: 'panasonic', name: 'Panasonic V-Log', icon: '🎞️', image: '/samples/panasonic-log.jpg' },
]

// No default LUTs - users upload their own
// No default LUTs - users upload their own
// No default LUTs - users upload their own
const SAMPLE_LUTS: any[] = []


export default function LuvidApp() {
    const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
    const [selectedLUT, setSelectedLUT] = useState<number | null>(null)
    const [lutIntensity, setLutIntensity] = useState(100)
    const [exposure, setExposure] = useState(0)
    const [contrast, setContrast] = useState(0)
    const [saturation, setSaturation] = useState(0)
    const [temperature, setTemperature] = useState(0)
    const [sliderPosition, setSliderPosition] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const [uploadedLUTs, setUploadedLUTs] = useState<any[]>([])
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [parsedLUTData, setParsedLUTData] = useState<any>(null)
    const [loadedDefaultLUTs, setLoadedDefaultLUTs] = useState<any[]>([])
    const canvasRef = useRef<HTMLDivElement>(null)
    const beforeCanvasRef = useRef<HTMLCanvasElement>(null)
    const afterCanvasRef = useRef<HTMLCanvasElement>(null)

    // Handle split-view slider
    const handleMouseDown = () => setIsDragging(true)
    const handleMouseUp = () => setIsDragging(false)

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !canvasRef.current) return
        const rect = canvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = (x / rect.width) * 100
        setSliderPosition(Math.max(0, Math.min(100, percentage)))
    }

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mouseup', handleMouseUp as any)
            return () => document.removeEventListener('mouseup', handleMouseUp as any)
        }
    }, [isDragging])

    // Handle Image Upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            setUploadedImage(event.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    // Parse .cube LUT file
    const parseCubeLUT = (content: string) => {
        const lines = content.split('\n')
        const lutData: number[][] = []
        let size = 33

        lines.forEach(line => {
            const trimmed = line.trim()
            if (trimmed.startsWith('LUT_3D_SIZE')) {
                size = parseInt(trimmed.split(/\s+/)[1])
            }
            if (trimmed.match(/^[\d.]+\s+[\d.]+\s+[\d.]+$/)) {
                const [r, g, b] = trimmed.split(/\s+/).map(Number)
                lutData.push([r, g, b])
            }
        })

        return { size, data: lutData }
    }

    // Handle LUT folder upload
    const handleLUTUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        Array.from(files).forEach(file => {
            if (file.name.endsWith('.cube')) {
                const reader = new FileReader()
                reader.onload = (event) => {
                    const content = event.target?.result as string
                    const parsed = parseCubeLUT(content)

                    // Generate thumbnail from actual LUT data
                    const thumbnail = generateAdvancedLUTThumbnail(parsed)

                    const newLUT = {
                        id: Date.now() + Math.random(), // Ensure unique IDs
                        name: file.name.replace('.cube', ''),
                        file: file.name,
                        parsedData: parsed,
                        thumbnail: thumbnail
                    }

                    setUploadedLUTs(prev => [...prev, newLUT])

                    // If this is the first LUT uploaded, set it as selected and parse it
                    if (!selectedLUT) {
                        setSelectedLUT(newLUT.id)
                        setParsedLUTData(parsed)
                    }
                }
                reader.readAsText(file)
            }
        })
    }

    // Handle LUT Export
    const handleExportLUT = () => {
        if (!selectedLUT) return

        const lut = allLUTs.find(l => l.id === selectedLUT)
        if (!lut) return

        // Generate a simple .cube file
        const lutName = `${lut.name}_Custom_${Date.now()}`
        let cubeContent = `TITLE "${lutName}"\n`
        cubeContent += `LUT_3D_SIZE 17\n\n`

        // Generate simple LUT data (17x17x17 cube)
        for (let b = 0; b < 17; b++) {
            for (let g = 0; g < 17; g++) {
                for (let r = 0; r < 17; r++) {
                    let rVal = r / 16
                    let gVal = g / 16
                    let bVal = b / 16

                    // Apply adjustments
                    const exposureFactor = Math.pow(2, exposure / 50)
                    rVal *= exposureFactor
                    gVal *= exposureFactor
                    bVal *= exposureFactor

                    // Apply saturation
                    const gray = 0.2989 * rVal + 0.5870 * gVal + 0.1140 * bVal
                    const satFactor = 1 + (saturation / 50)
                    rVal = gray + (rVal - gray) * satFactor
                    gVal = gray + (gVal - gray) * satFactor
                    bVal = gray + (bVal - gray) * satFactor

                    // Clamp values
                    rVal = Math.max(0, Math.min(1, rVal))
                    gVal = Math.max(0, Math.min(1, gVal))
                    bVal = Math.max(0, Math.min(1, bVal))

                    cubeContent += `${rVal.toFixed(6)} ${gVal.toFixed(6)} ${bVal.toFixed(6)}\n`
                }
            }
        }

        // Download the file
        const blob = new Blob([cubeContent], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${lutName}.cube`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // Reset all grading parameters
    const handleResetAll = () => {
        setLutIntensity(100)
        setExposure(0)
        setContrast(0)
        setSaturation(0)
        setTemperature(0)
    }

    // Remove uploaded image
    const handleRemoveImage = () => {
        setUploadedImage(null)
        // Reset canvas
        if (beforeCanvasRef.current && afterCanvasRef.current) {
            const beforeCtx = beforeCanvasRef.current.getContext('2d')
            const afterCtx = afterCanvasRef.current.getContext('2d')
            if (beforeCtx && afterCtx) {
                beforeCtx.clearRect(0, 0, beforeCanvasRef.current.width, beforeCanvasRef.current.height)
                afterCtx.clearRect(0, 0, afterCanvasRef.current.width, afterCanvasRef.current.height)
            }
        }
    }

    // Remove uploaded LUT
    const handleRemoveLUT = (lutId: number) => {
        setUploadedLUTs(prev => prev.filter(lut => lut.id !== lutId))
        // If the removed LUT was selected, clear selection
        if (selectedLUT === lutId) {
            setSelectedLUT(null)
            setParsedLUTData(null)
        }
    }

    // Load default LUTs from files (disabled - files don't exist yet)
    useEffect(() => {
        // Just use SAMPLE_LUTS as-is for now
        setLoadedDefaultLUTs(SAMPLE_LUTS)
    }, [])

    const allLUTs = useMemo(() => [...loadedDefaultLUTs, ...uploadedLUTs], [loadedDefaultLUTs, uploadedLUTs])

    // Apply LUT to image using canvas with debouncing for smooth performance
    const [sourceImageData, setSourceImageData] = useState<ImageData | null>(null)

    // 1. Handle Image Loading (Run only when image changes)
    useEffect(() => {
        if (!uploadedImage) {
            setSourceImageData(null)
            if (beforeCanvasRef.current && afterCanvasRef.current) {
                const beforeCtx = beforeCanvasRef.current.getContext('2d')
                const afterCtx = afterCanvasRef.current.getContext('2d')
                beforeCtx?.clearRect(0, 0, beforeCanvasRef.current.width, beforeCanvasRef.current.height)
                afterCtx?.clearRect(0, 0, afterCanvasRef.current.width, afterCanvasRef.current.height)
            }
            return
        }

        const img = new Image()
        img.onload = () => {
            if (beforeCanvasRef.current && afterCanvasRef.current) {
                // Set canvas size to match image
                beforeCanvasRef.current.width = img.width
                beforeCanvasRef.current.height = img.height
                afterCanvasRef.current.width = img.width
                afterCanvasRef.current.height = img.height

                const beforeCtx = beforeCanvasRef.current.getContext('2d')!
                const afterCtx = afterCanvasRef.current.getContext('2d')!

                // Draw original image on both canvases
                beforeCtx.drawImage(img, 0, 0)
                afterCtx.drawImage(img, 0, 0)

                // Cache the source image data
                setSourceImageData(beforeCtx.getImageData(0, 0, img.width, img.height))
            }
        }
        img.src = uploadedImage
    }, [uploadedImage])

    // 2. Handle Real-time Processing (Run on slider/LUT changes)
    useEffect(() => {
        if (!sourceImageData || !afterCanvasRef.current) return

        const afterCtx = afterCanvasRef.current.getContext('2d')!

        // Create a copy of the source data to modify
        const workingData = new ImageData(
            new Uint8ClampedArray(sourceImageData.data),
            sourceImageData.width,
            sourceImageData.height
        )

        // Find selected LUT data or null
        let lutData = null
        if (selectedLUT) {
            const lut = allLUTs.find(l => l.id === selectedLUT)
            if (lut) {
                lutData = lut.parsedData || parsedLUTData
            }
        }

        // Apply processing (LUT + Grading)
        // Professional LUT processor with trilinear interpolation
        // Optimized: running on cached data array
        processImageWithLUT(
            workingData,
            lutData,
            lutIntensity,
            {
                exposure,
                contrast,
                saturation,
                temperature
            }
        )

        afterCtx.putImageData(workingData, 0, 0)

    }, [sourceImageData, selectedLUT, lutIntensity, exposure, contrast, saturation, temperature, parsedLUTData, allLUTs])

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col">
            {/* Header */}
            <header className="glass-panel-strong border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-blue-500 rounded-lg flex items-center justify-center">
                        <Film className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">LUVID</h1>
                        <p className="text-xs text-white/40 technical-text">Visualize. Customize. Export.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="glass-panel px-4 py-2 hover:bg-white/5 transition-smooth flex items-center gap-2">
                        <Play className="w-4 h-4 text-neon-gold" />
                        <Lock className="w-3 h-3 text-neon-gold" />
                        <span className="text-sm text-neon-gold technical-text">Video Mode</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - The Vault */}
                <aside className="w-20 glass-panel-strong border-r border-white/10 flex flex-col items-center py-6 gap-4">
                    <div className="technical-text text-white/40 mb-4 rotate-180" style={{ writingMode: 'vertical-rl' }}>
                        LOG PROFILES
                    </div>

                    {LOG_PROFILES.map((profile) => (
                        <button
                            key={profile.id}
                            onClick={() => setSelectedProfile(profile.id)}
                            className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-smooth ${selectedProfile === profile.id
                                ? 'bg-neon-cyan/20 ring-2 ring-neon-cyan neon-glow'
                                : 'glass-panel hover:bg-white/5'
                                }`}
                            title={profile.name}
                        >
                            {profile.icon}
                        </button>
                    ))}
                </aside>

                {/* Center Stage - The Canvas */}
                <main className="flex-1 flex flex-col p-6 gap-6">
                    <div
                        ref={canvasRef}
                        className="flex-1 glass-panel relative overflow-hidden cursor-col-resize"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseUp}
                    >
                        {uploadedImage ? (
                            <>
                                {/* Before/After Split View with Real Canvases */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black">
                                    {/* Before Canvas (Raw) */}
                                    <div
                                        className="absolute inset-0 flex items-center justify-center"
                                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                                    >
                                        <canvas
                                            ref={beforeCanvasRef}
                                            className="max-w-full max-h-full object-contain"
                                        />

                                        {/* Remove Image Button - Highly visible */}
                                        <button
                                            onClick={handleRemoveImage}
                                            className="absolute top-4 right-4 p-2.5 bg-red-600 hover:bg-red-700 hover:scale-110 rounded-lg transition-all shadow-2xl z-50 border-2 border-white/20"
                                            title="Remove Image"
                                        >
                                            <X className="w-5 h-5 text-white" />
                                        </button>
                                    </div>

                                    {/* After Canvas (LUT Applied) */}
                                    <div
                                        className="absolute inset-0 flex items-center justify-center"
                                        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                                    >
                                        <canvas
                                            ref={afterCanvasRef}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Draggable Slider */}
                                <div
                                    className="absolute top-0 bottom-0 w-1 bg-neon-cyan neon-glow cursor-col-resize z-10"
                                    style={{ left: `${sliderPosition}%` }}
                                    onMouseDown={handleMouseDown}
                                >
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-neon-cyan rounded-full neon-glow flex items-center justify-center">
                                        <Layers className="w-4 h-4 text-black" />
                                    </div>
                                </div>
                            </>
                        ) : selectedProfile ? (
                            <>
                                {/* Placeholder gradient view */}
                                <div className="absolute inset-0 flex">
                                    {/* Before (Raw Log) */}
                                    <div
                                        className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600"
                                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                                    >
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <p className="technical-text text-white/60 mb-2">RAW LOG</p>
                                                <p className="text-sm text-white/40">
                                                    {LOG_PROFILES.find(p => p.id === selectedProfile)?.name}
                                                </p>
                                                <label className="glass-panel px-4 py-2 hover:bg-white/5 transition-smooth cursor-pointer inline-flex items-center gap-2 mt-4">
                                                    <Upload className="w-4 h-4 text-neon-cyan" />
                                                    <span className="text-xs technical-text text-neon-cyan">UPLOAD IMAGE</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleImageUpload}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* After (LUT Applied) */}
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                                            background: selectedLUT
                                                ? (() => {
                                                    const lut = allLUTs.find(l => l.id === selectedLUT)
                                                    if (!lut?.colors) return 'linear-gradient(to br, rgb(107, 114, 128), rgb(75, 85, 99), rgb(55, 65, 81))'

                                                    const baseH = lut.colors.h + (temperature * 0.5)
                                                    const baseS = Math.max(0, Math.min(100, lut.colors.s + saturation))
                                                    const baseL = Math.max(10, Math.min(90, lut.colors.l + (exposure * 0.4)))

                                                    return `linear-gradient(135deg, 
                                                        hsl(${baseH}, ${baseS}%, ${baseL + 10}%),
                                                        hsl(${baseH + 10}, ${baseS - 10}%, ${baseL}%),
                                                        hsl(${baseH + 20}, ${baseS - 20}%, ${baseL - 10}%)
                                                    )`
                                                })()
                                                : 'linear-gradient(to br, rgb(107, 114, 128), rgb(75, 85, 99), rgb(55, 65, 81))',
                                            filter: `contrast(${100 + contrast}%) saturate(${100 + (saturation * 2)}%)`,
                                            opacity: lutIntensity / 100
                                        }}
                                    >
                                        <div className="w-full h-full flex items-center justify-center">
                                            {selectedLUT && (
                                                <div className="text-center">
                                                    <p className="technical-text text-white/80 mb-2">LUT APPLIED</p>
                                                    <p className="text-sm text-white/60">
                                                        {allLUTs.find(l => l.id === selectedLUT)?.name}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Draggable Slider */}
                                <div
                                    className="absolute top-0 bottom-0 w-1 bg-neon-cyan neon-glow cursor-col-resize z-10"
                                    style={{ left: `${sliderPosition}%` }}
                                    onMouseDown={handleMouseDown}
                                >
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-neon-cyan rounded-full neon-glow flex items-center justify-center">
                                        <Layers className="w-4 h-4 text-black" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                    <Film className="w-16 h-16 text-white/20 mx-auto mb-4" />
                                    <p className="technical-text text-white/40 mb-4">UPLOAD AN IMAGE TO START</p>
                                    <label className="glass-panel px-6 py-3 hover:bg-white/5 transition-smooth cursor-pointer inline-flex items-center gap-2 mb-3">
                                        <Upload className="w-5 h-5 text-neon-cyan" />
                                        <span className="text-sm technical-text text-neon-cyan">UPLOAD IMAGE</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                    </label>
                                    <p className="text-xs text-white/20">JPG, PNG, or TIFF • Log footage recommended</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Strip - The Look Deck */}
                    <div className="glass-panel p-4">
                        <div className="flex items-center gap-4 mb-3">
                            <p className="technical-text text-white/60">LUT LIBRARY</p>
                            <label className="glass-panel px-3 py-1.5 hover:bg-white/5 transition-smooth cursor-pointer flex items-center gap-2">
                                <Upload className="w-4 h-4 text-neon-cyan" />
                                <span className="text-xs technical-text text-neon-cyan">UPLOAD .CUBE</span>
                                <input
                                    type="file"
                                    multiple
                                    accept=".cube"
                                    className="hidden"
                                    onChange={handleLUTUpload}
                                />
                            </label>
                        </div>

                        <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 max-h-32">
                            {allLUTs.map((lut) => (
                                <button
                                    key={lut.id}
                                    onClick={() => setSelectedLUT(lut.id)}
                                    className={`flex-shrink-0 w-40 rounded-lg transition-smooth overflow-hidden group ${selectedLUT === lut.id
                                        ? 'ring-2 ring-neon-cyan neon-glow scale-105'
                                        : 'ring-1 ring-white/20'
                                        }`}
                                >
                                    {/* LUT Preview Card */}
                                    <div className="relative bg-gray-900">
                                        {/* Preview Area with Palette Bar */}
                                        {/* Preview Area - No Palette Bar */}
                                        <div className="w-full h-24 relative overflow-hidden">
                                            <div className="w-full h-full relative">
                                                {/* Remove button - Shows on hover */}
                                                {uploadedLUTs.some(uploaded => uploaded.id === lut.id) && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleRemoveLUT(lut.id)
                                                        }}
                                                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 hover:bg-red-700 hover:scale-110 rounded-full transition-all opacity-0 group-hover:opacity-100 z-20 shadow-lg border border-white/20"
                                                        title="Remove LUT"
                                                    >
                                                        <X className="w-3 h-3 text-white" />
                                                    </button>
                                                )}

                                                {/* Common preview portrait */}
                                                <div className="absolute inset-0">
                                                    <img
                                                        src="/lut-preview.png"
                                                        alt="LUT Preview"
                                                        className="w-full h-full object-cover object-center"
                                                    />
                                                    {/* Color overlay to simulate LUT effect */}
                                                    <div
                                                        className="absolute inset-0 mix-blend-overlay opacity-60"
                                                        style={{
                                                            background: `linear-gradient(135deg, 
                                                                  hsl(${lut.id * 30}, 60%, 40%),
                                                                  hsl(${lut.id * 30 + 20}, 50%, 50%)
                                                                )`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* LUT Name */}
                                        <div className="px-3 py-2 bg-black/80 backdrop-blur-sm border-t border-white/10">
                                            <p className="text-xs font-semibold text-white/95 truncate text-center tracking-wide">
                                                {lut.name}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </main>

                {/* Right Panel - The Inspector */}
                <aside className="w-80 glass-panel-strong border-l border-white/10 flex flex-col p-6 gap-6 overflow-y-auto custom-scrollbar">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="technical-text text-white/80">LUT INTENSITY</h2>
                            <button
                                onClick={() => setLutIntensity(100)}
                                disabled={!selectedLUT || lutIntensity === 100}
                                className="p-1.5 rounded hover:bg-white/10 transition-smooth disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Reset to 100%"
                            >
                                <RotateCcw className="w-3.5 h-3.5 text-white/60" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={lutIntensity}
                                onChange={(e) => setLutIntensity(Number(e.target.value))}
                                disabled={!selectedLUT}
                            />
                            <div className="flex justify-between text-xs text-white/40">
                                <span>0%</span>
                                <span className="text-neon-cyan">{lutIntensity}%</span>
                                <span>100%</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/5 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="technical-text text-white/80">GRADING TOOLS</h2>
                        </div>

                        {/* Exposure */}
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Sun className="w-4 h-4 text-white/60" />
                                <label className="text-sm text-white/60">Exposure</label>
                                <span className="ml-auto text-xs text-neon-cyan">{exposure > 0 ? '+' : ''}{exposure}</span>
                                <button
                                    onClick={() => setExposure(0)}
                                    disabled={!uploadedImage || exposure === 0}
                                    className="p-1 rounded hover:bg-white/10 transition-smooth disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Reset to 0"
                                >
                                    <RotateCcw className="w-3 h-3 text-white/60" />
                                </button>
                            </div>
                            <input
                                type="range"
                                min="-50"
                                max="50"
                                value={exposure}
                                onChange={(e) => setExposure(Number(e.target.value))}
                                disabled={!uploadedImage}
                            />
                        </div>

                        {/* Contrast */}
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Contrast className="w-4 h-4 text-white/60" />
                                <label className="text-sm text-white/60">Contrast</label>
                                <span className="ml-auto text-xs text-neon-cyan">{contrast > 0 ? '+' : ''}{contrast}</span>
                                <button
                                    onClick={() => setContrast(0)}
                                    disabled={!uploadedImage || contrast === 0}
                                    className="p-1 rounded hover:bg-white/10 transition-smooth disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Reset to 0"
                                >
                                    <RotateCcw className="w-3 h-3 text-white/60" />
                                </button>
                            </div>
                            <input
                                type="range"
                                min="-50"
                                max="50"
                                value={contrast}
                                onChange={(e) => setContrast(Number(e.target.value))}
                                disabled={!uploadedImage}
                            />
                        </div>

                        {/* Saturation */}
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Droplets className="w-4 h-4 text-white/60" />
                                <label className="text-sm text-white/60">Saturation</label>
                                <span className="ml-auto text-xs text-neon-cyan">{saturation > 0 ? '+' : ''}{saturation}</span>
                                <button
                                    onClick={() => setSaturation(0)}
                                    disabled={!uploadedImage || saturation === 0}
                                    className="p-1 rounded hover:bg-white/10 transition-smooth disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Reset to 0"
                                >
                                    <RotateCcw className="w-3 h-3 text-white/60" />
                                </button>
                            </div>
                            <input
                                type="range"
                                min="-50"
                                max="50"
                                value={saturation}
                                onChange={(e) => setSaturation(Number(e.target.value))}
                                disabled={!uploadedImage}
                            />
                        </div>

                        {/* Temperature */}
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Thermometer className="w-4 h-4 text-white/60" />
                                <label className="text-sm text-white/60">Temperature</label>
                                <span className="ml-auto text-xs text-neon-cyan">{temperature > 0 ? '+' : ''}{temperature}</span>
                                <button
                                    onClick={() => setTemperature(0)}
                                    disabled={!uploadedImage || temperature === 0}
                                    className="p-1 rounded hover:bg-white/10 transition-smooth disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Reset to 0"
                                >
                                    <RotateCcw className="w-3 h-3 text-white/60" />
                                </button>
                            </div>
                            <input
                                type="range"
                                min="-50"
                                max="50"
                                value={temperature}
                                onChange={(e) => setTemperature(Number(e.target.value))}
                                disabled={!uploadedImage}
                            />
                        </div>

                        {/* Reset All Button */}
                        <button
                            onClick={handleResetAll}
                            disabled={!uploadedImage}
                            className="w-full mt-4 py-2.5 rounded-lg font-semibold technical-text transition-smooth border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            title="Reset all grading parameters"
                        >
                            <RotateCcw className="w-4 h-4" />
                            RESET ALL
                        </button>
                    </div>

                    <div className="border-t border-white/5 pt-6 mt-auto">
                        {/* Export Button */}
                        <button
                            disabled={!selectedLUT}
                            onClick={handleExportLUT}
                            className={`w-full py-4 rounded-lg font-semibold technical-text transition-smooth ${selectedLUT
                                ? 'bg-neon-cyan text-black hover:bg-neon-cyan/90 neon-glow animate-glow'
                                : 'bg-white/5 text-white/30 cursor-not-allowed'
                                }`}
                        >
                            <Download className="w-5 h-5 inline-block mr-2" />
                            EXPORT LUT
                        </button>

                        {/* Batch Export (Locked) */}
                        <button
                            disabled
                            className="w-full mt-3 py-3 rounded-lg font-semibold technical-text bg-white/5 text-neon-gold/50 cursor-not-allowed flex items-center justify-center gap-2 gold-glow"
                        >
                            <Lock className="w-4 h-4" />
                            BATCH EXPORT
                            <span className="text-xs">(PRO)</span>
                        </button>
                    </div>
                </aside>
            </div>

            {/* Footer - Dream Road Pictures */}
            <footer className="glass-panel-strong border-t border-white/10 px-6 py-3 text-center">
                <p className="text-xs text-white/30">
                    Powered by <span className="text-white/50 font-semibold">Dream Road Pictures</span>
                </p>
            </footer>
        </div>
    )
}
