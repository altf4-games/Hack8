// Create this file at: app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const tags = formData.get("tags") as string;
    const description = formData.get("description") as string;
    
    // Validate required fields
    if (!title || !category || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Create array to store uploaded file info
    const uploadedFiles = [];
    
    // Get all files from form data
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("file-") && value instanceof Blob) {
        const file = value as File;
        
        // Create uploads directory if it doesn't exist
        const uploadDir = join(process.cwd(), "public", "uploads");
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }
        
        // Generate unique filename
        const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        const filePath = join(uploadDir, uniqueFilename);
        
        // Convert file to buffer and save to filesystem
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);
        
        // Add file info to array
        uploadedFiles.push({
          originalName: file.name,
          filename: uniqueFilename,
          size: file.size,
          type: file.type,
          url: `/uploads/${uniqueFilename}`
        });
      }
    }
    
    // Save to database (this is where you'd integrate with your DB)
    // For this example, we'll just return the data
    const resourceData = {
      title,
      category,
      tags: tags.split(",").map(tag => tag.trim()),
      description,
      files: uploadedFiles,
      author: "current_user", // You would get this from session
      dateCreated: new Date().toISOString()
    };
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "Files uploaded successfully",
      data: resourceData
    });
    
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}

// To handle larger file uploads, you may need to adjust the config
export const config = {
  api: {
    bodyParser: false, // Disables body parsing, needed for file uploads
  },
};