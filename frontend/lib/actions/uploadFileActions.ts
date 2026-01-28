"use server";

import { auth } from "@/auth";
import { Client } from "minio";
import { Pool } from "pg";

// Initialize MinIO Client (matches your Docker setup)
const minioClient = new Client({
  endPoint: "minio", // Docker service name (or 'localhost' if running locally)
  port: 9000,
  useSSL: false,
  accessKey: "minioadmin", // Update if you changed these in docker-compose
  secretKey: "minioadmin",
});

export async function getPresignedUploadUrl(filename: string, contentType: string) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!userEmail) return { success: false, error: "Unauthorized" };
    
    const bucketName = "invoices";
    
    // Create a unique file path: "uploads/filename.pdf"
    // (Optional: You can add UUIDs here to prevent overwrites)
    const objectName = `uploads/${userEmail}/${filename}`;

    // 1. Generate URL
    const url = await minioClient.presignedPutObject(bucketName, objectName, 15 * 60);

    return { success: true, url, objectName };
  } catch (error) {
    console.error("MinIO Error:", error);
    return { success: false, error: "Failed to generate upload URL" };
  }
}

export async function getPresignedDownloadUrl(bucketName: string, objectName: string) {

  try {
    // Generate the Presigned URL (Valid for 15 minutes)
    const url = await minioClient.presignedGetObject(bucketName, objectName, 15 * 60);

    return { success: true, url };
  } catch (error) {
    console.error("MinIO Download Error:", error);
    return { success: false, error: "Failed to generate download URL" };
  }
}



// Initialize Postgres Pool (matches your Docker setup)
const pool = new Pool({
  connectionString: "postgres://user:password@localhost:5432/invoice_db", // Update host if running inside docker vs localhost
});

export async function getLatestReceipt(filename: string) {

  try {
    // We search for the invoice where the original filename matches.
    // We add a slight delay logic or retry in the frontend, but this query gets the data.
    const query = `
      SELECT * FROM invoices 
      WHERE original_filename = $1 
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    const result = await pool.query(query, [filename]);
    
    if (result.rows.length === 0) {
      return { success: false, error: "Receipt not found yet" };
    }

    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to fetch receipt" };
  }
}