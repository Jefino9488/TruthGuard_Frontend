// app/api/upload-media/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/mov', 'video/avi'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        // Validate file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 });
        }

        // Create temp directory if it doesn't exist
        const tempDir = path.join(process.cwd(), 'temp');
        try {
            await mkdir(tempDir, { recursive: true });
        } catch (error) {
            // Directory already exists, continue
        }

        // Generate unique file ID and save file
        const fileId = uuidv4();
        const fileExtension = path.extname(file.name);
        const fileName = `${fileId}${fileExtension}`;
        const filePath = path.join(tempDir, fileName);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        return NextResponse.json({
            fileId,
            fileName: file.name,
            filePath,
            size: file.size,
            type: file.type
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}