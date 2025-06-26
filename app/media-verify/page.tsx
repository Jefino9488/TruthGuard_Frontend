"use client"

import { useState, useCallback } from 'react'
import { UploadCloud, Image, Video, Check, X, AlertCircle, Info } from 'lucide-react'

interface AnalysisResult {
    isAI: boolean;
    confidence: number;
    details: {
        model?: string;
        probability: number;
        artifacts: string[];
    };
    rawData?: any;
}

export default function MediaVerificationPage() {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<AnalysisResult | null>(null)
    const [dragActive, setDragActive] = useState(false)

    const handleFiles = useCallback((files: FileList | null) => {
        const acceptedFile = files?.[0]
        if (!acceptedFile) return

        // Reset previous state
        setFile(acceptedFile)
        setResult(null)
        setError(null)
        setProgress(0)

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/mov', 'video/avi']
        if (!validTypes.includes(acceptedFile.type)) {
            setError('Unsupported file type. Please use JPG, PNG, WebP, MP4, MOV, or AVI.')
            return
        }

        // Validate file size (50MB limit)
        if (acceptedFile.size > 50 * 1024 * 1024) {
            setError('File size exceeds 50MB limit')
            return
        }

        // Create preview
        if (acceptedFile.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    setPreview(reader.result)
                }
            }
            reader.readAsDataURL(acceptedFile)
        } else {
            const videoUrl = URL.createObjectURL(acceptedFile)
            setPreview(videoUrl)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        const droppedFiles = Array.from(e.dataTransfer.files)
        if (droppedFiles?.length) {
            handleFiles(e.dataTransfer.files)
        }
    }, [handleFiles])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
    }, [])

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files)
        }
    }, [handleFiles])

    const verifyMedia = async () => {
        if (!file) return

        setIsLoading(true)
        setError(null)
        setProgress(10)

        try {
            const formData = new FormData()
            formData.append('file', file)

            // Upload file
            setProgress(30)
            const uploadResponse = await fetch('/api/upload-media', {
                method: 'POST',
                body: formData
            })

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json()
                setError(errorData.error || 'Failed to upload file')
                return
            }

            const { fileId } = await uploadResponse.json()
            setProgress(60)

            // Analyze with AI detection
            const analysisResponse = await fetch('/api/detect-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fileId })
            })

            if (!analysisResponse.ok) {
                const errorData = await analysisResponse.json()
                setError(errorData.error || 'Analysis failed')
                return
            }

            setProgress(90)
            const data = await analysisResponse.json()

            setResult({
                isAI: data.isAI,
                confidence: data.confidence,
                details: data.details
            })
            setProgress(100)
        } catch (err: unknown) {
            console.error('Verification failed:', err)
            if (err instanceof Error) {
                setError(err.message)
            } else {
                setError('Unknown error occurred')
            }
        } finally {
            setIsLoading(false)
            setTimeout(() => setProgress(0), 1000)
        }
    }

    const reset = () => {
        setFile(null)
        setPreview(null)
        setResult(null)
        setError(null)
        if (preview && preview.startsWith('blob:')) {
            URL.revokeObjectURL(preview)
        }
    }

    const renderConfidenceBar = (confidence: number) => {
        const width = `${Math.min(100, Math.max(0, confidence))}%`
        const colorClass = confidence > 70 ? 'bg-red-500' : confidence > 30 ? 'bg-yellow-500' : 'bg-green-500'

        return (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                    className={`h-2.5 rounded-full ${colorClass}`}
                    style={{ width }}
                ></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">AI Media Verification</h1>
            <p className="text-gray-600 mb-8 text-center">
                Upload an image or video to check if it was generated by AI. Our system analyzes
                subtle artifacts and patterns that often appear in AI-generated media.
            </p>

            {!file ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onClick={() => {
                        const fileInput = document.getElementById('file-input') as HTMLInputElement;
                        if (fileInput) fileInput.click();
                    }}
                >
                    <input
                        id="file-input"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileInput}
                        className="hidden"
                    />
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-700">
                        {dragActive ? 'Drop the file here' : 'Drag & drop an image or video here'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">or click to select a file</p>
                    <p className="text-xs text-gray-400 mt-4">Supports: JPG, PNG, WebP, MP4, MOV, AVI (Max 50MB)</p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            {file.type.startsWith('image/') ? (
                                <Image className="h-5 w-5 text-blue-500" />
                            ) : (
                                <Video className="h-5 w-5 text-blue-500" />
                            )}
                            <span className="font-medium">{file.name}</span>
                            <span className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                        <button
                            onClick={reset}
                            className="text-sm text-red-500 hover:text-red-700 font-medium"
                        >
                            Remove
                        </button>
                    </div>

                    <div className="relative bg-gray-50 rounded-lg p-4">
                        {file.type.startsWith('image/') ? (
                            <img
                                src={preview || ''}
                                alt="Preview"
                                className="max-h-96 w-auto mx-auto rounded-lg border shadow-sm"
                            />
                        ) : (
                            <video
                                src={preview || ''}
                                controls
                                className="max-h-96 w-auto mx-auto rounded-lg border shadow-sm"
                            />
                        )}
                    </div>

                    {isLoading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Analyzing media...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {!isLoading && !result && (
                        <button
                            onClick={verifyMedia}
                            className="w-full py-3 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                        >
                            <span>Verify Authenticity</span>
                        </button>
                    )}

                    {error && (
                        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                            <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium text-red-800">Error</h3>
                                    <p className="text-sm text-red-600 mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-4">
                            <div
                                className={`p-4 rounded-lg border ${
                                    result.isAI ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                                }`}
                            >
                                <div className="flex items-start">
                                    {result.isAI ? (
                                        <X className="h-6 w-6 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                                    ) : (
                                        <Check className="h-6 w-6 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-medium text-lg">
                                            {result.isAI ? 'AI-Generated Content Detected' : 'Authentic Content'}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Confidence: {result.confidence}%
                                        </p>
                                        {renderConfidenceBar(result.confidence)}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="font-medium flex items-center">
                                    <Info className="h-5 w-5 text-blue-500 mr-2" />
                                    Analysis Details
                                </h4>
                                <div className="mt-2 space-y-2">
                                    {result.details.model && (
                                        <p className="text-sm">
                                            <span className="font-medium">Model Detected:</span> {result.details.model}
                                        </p>
                                    )}
                                    <p className="text-sm">
                                        <span className="font-medium">Probability:</span> {(result.details.probability * 100).toFixed(1)}%
                                    </p>
                                    {result.details.artifacts.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium">Detected Artifacts:</p>
                                            <ul className="text-sm list-disc list-inside space-y-1">
                                                {result.details.artifacts.map((artifact, i) => (
                                                    <li key={i} className="text-gray-700">{artifact}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={reset}
                                    className="px-6 py-2 rounded-lg font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                                >
                                    Analyze Another File
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-12 border-t pt-8">
                <h2 className="text-xl font-semibold mb-4">How Our Detection Works</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">1. Digital Fingerprinting</h3>
                        <p className="text-sm text-gray-600">
                            Analyzes pixel-level patterns and compression artifacts that are characteristic of AI-generated content.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">2. Metadata Analysis</h3>
                        <p className="text-sm text-gray-600">
                            Examines file metadata and creation patterns that often differ between human-created and AI-generated media.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">3. Deep Learning Models</h3>
                        <p className="text-sm text-gray-600">
                            Uses specialized neural networks trained to recognize signatures of popular AI generation models.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}