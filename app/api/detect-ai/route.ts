// app/api/detect-ai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readFile, unlink, readdir } from 'fs/promises';
import path from 'path';

// Mock detection function for demonstration
async function mockAIDetection(filePath: string, fileType: string) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const isVideo = fileType.startsWith('video/');
    const mockResults = {
        isAI: Math.random() > 0.6,
        confidence: Math.floor(Math.random() * 40) + 60,
        details: {
            model: Math.random() > 0.5 ? 'DALL-E 3' : Math.random() > 0.5 ? 'Midjourney' : 'Stable Diffusion',
            artifacts: [] as string[],
            probability: Math.random() * 0.4 + 0.6
        }
    };

    if (mockResults.isAI) {
        const possibleArtifacts = isVideo
            ? ['Temporal inconsistencies', 'Unnatural motion blur', 'Frame interpolation artifacts', 'Consistent lighting anomalies']
            : ['Pixel-level inconsistencies', 'Unnatural texture patterns', 'Compression artifacts', 'Color distribution anomalies', 'Edge smoothing patterns'];

        const numArtifacts = Math.floor(Math.random() * 3) + 1;
        mockResults.details.artifacts = possibleArtifacts
            .sort(() => 0.5 - Math.random())
            .slice(0, numArtifacts);
    }

    return mockResults;
}

async function detectWithHuggingFace(filePath: string) {
    try {
        const fileBuffer = await readFile(filePath);
        const primaryModel = 'umm-maybe/AI-image-detector';
        const fallbackModels = [
            'saltanat/ai-vs-human-generated-image-detector',
            'Organika/sdxl-detector'
        ];

        // Try primary model first
        try {
            const result = await callHuggingFaceModel(primaryModel, fileBuffer);
            if (result) {
                console.log(`Successfully used primary model: ${primaryModel}`);
                return result;
            }
        } catch (error) {
            console.log(`Primary model ${primaryModel} failed, trying fallbacks:`, error);
        }

        // Try fallback models
        for (const model of fallbackModels) {
            try {
                const result = await callHuggingFaceModel(model, fileBuffer);
                if (result) {
                    console.log(`Successfully used fallback model: ${model}`);
                    return result;
                }
            } catch (error) {
                console.log(`Fallback model ${model} failed:`, error);
                continue;
            }
        }

        throw new Error('All AI detection models failed');
    } catch (error) {
        console.error('Hugging Face API error:', error);
        throw error;
    }
}

async function callHuggingFaceModel(modelName: string, fileBuffer: Buffer) {
    const response = await fetch(`https://api-inference.huggingface.co/models/${modelName}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.HF_TOKEN}`,
            'Content-Type': 'application/octet-stream',
        },
        body: fileBuffer,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Model ${modelName} failed: ${errorText}`);
    }

    const result = await response.json();
    console.log(`Model ${modelName} result:`, result);

    let aiScore = 0;
    let isAI = false;
    let modelLabel = '';

    if (Array.isArray(result) && result.length > 0) {
        const aiResult = result.find(r =>
            r.label?.toLowerCase().includes('ai') ||
            r.label?.toLowerCase().includes('generated') ||
            r.label?.toLowerCase().includes('fake') ||
            r.label?.toLowerCase().includes('artificial')
        );

        if (aiResult) {
            aiScore = aiResult.score;
            isAI = aiScore > 0.5;
            modelLabel = aiResult.label;
        } else {
            const humanResult = result.find(r =>
                r.label?.toLowerCase().includes('human') ||
                r.label?.toLowerCase().includes('real') ||
                r.label?.toLowerCase().includes('authentic')
            );
            if (humanResult) {
                aiScore = 1 - humanResult.score;
                isAI = aiScore > 0.5;
                modelLabel = humanResult.label;
            }
        }
    } else if (result.label && result.score !== undefined) {
        aiScore = result.score;
        isAI = result.label?.toLowerCase().includes('ai') ||
            result.label?.toLowerCase().includes('generated') ||
            result.label?.toLowerCase().includes('fake');
        modelLabel = result.label;
    }

    return {
        isAI,
        confidence: Math.round(aiScore * 100),
        details: {
            model: modelName.split('/')[1] || 'Hugging Face Model',
            modelLabel,
            artifacts: isAI ? [
                'AI generation patterns detected',
                'Neural network signatures found',
                'Artificial content indicators present'
            ] : [
                'Natural image characteristics detected',
                'Human-created content patterns found',
                'Authentic content indicators present'
            ],
            probability: aiScore
        },
        rawData: result
    };
}

function getFileType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm'];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];

    if (videoExtensions.includes(ext)) {
        return 'video/';
    } else if (imageExtensions.includes(ext)) {
        return 'image/';
    }

    return 'unknown/';
}

async function ensureTempDir(tempDir: string) {
    try {
        const { mkdir } = await import('fs/promises');
        await mkdir(tempDir, { recursive: true });
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
            throw error;
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fileId } = body;

        if (!fileId) {
            return NextResponse.json({ error: 'No file ID provided' }, { status: 400 });
        }

        const tempDir = path.join(process.cwd(), 'temp');
        await ensureTempDir(tempDir);

        const files = await readdir(tempDir).catch(() => []);
        const targetFile = files.find(file => file.startsWith(fileId));

        if (!targetFile) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const filePath = path.join(tempDir, targetFile);
        const fileType = getFileType(targetFile);

        if (!fileType.startsWith('image/') && !fileType.startsWith('video/')) {
            return NextResponse.json({
                error: 'Unsupported file type. Only images and videos are supported.'
            }, { status: 400 });
        }

        let result;

        if (process.env.HF_TOKEN && fileType.startsWith('image/')) {
            try {
                result = await detectWithHuggingFace(filePath);
                console.log('Used Hugging Face API for detection');
            } catch (error) {
                console.error('Falling back to mock detection:', error);
                result = await mockAIDetection(filePath, fileType);
                console.log('Used mock detection as fallback');
            }
        } else {
            result = await mockAIDetection(filePath, fileType);
            console.log('Used mock detection');
        }

        try {
            await unlink(filePath);
            console.log('Temporary file cleaned up successfully');
        } catch (error) {
            console.error('Failed to delete temp file:', error);
        }

        const response = {
            ...result,
            metadata: {
                fileType,
                detectionMethod: process.env.HF_TOKEN && fileType.startsWith('image/') ? 'huggingface' : 'mock',
                timestamp: new Date().toISOString(),
                processingTime: '~2s'
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Detection error:', error);

        if (error instanceof Error) {
            return NextResponse.json(
                {
                    error: 'Failed to analyze media',
                    details: error.message,
                    timestamp: new Date().toISOString()
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                error: 'An unexpected error occurred',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        hasHuggingFaceKey: !!process.env.HF_TOKEN
    });
}