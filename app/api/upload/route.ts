import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Configure Cloudinary if credentials are present
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (isCloudinaryConfigured) {
      // Upload to Cloudinary
      return new Promise<Response>((resolve) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "logistics_documents",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              resolve(
                NextResponse.json(
                  { error: "Failed to upload to Cloudinary" },
                  { status: 500 }
                )
              );
            } else {
              resolve(
                NextResponse.json({
                  success: true,
                  url: result?.secure_url,
                })
              );
            }
          }
        );
        uploadStream.end(buffer);
      });
    } else {
      // Local storage fallback (Mock Storage)
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate a unique filename to avoid collision
      const fileExtension = path.extname(file.name);
      const uniqueFilename = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}${fileExtension}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      await fs.promises.writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${uniqueFilename}`,
      });
    }
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: error.message || "File upload failed" },
      { status: 500 }
    );
  }
}
