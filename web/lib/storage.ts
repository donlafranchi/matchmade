// Storage abstraction for photo uploads (T007)
// Supports S3-compatible storage (Cloudflare R2, AWS S3) and local filesystem for dev

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import fs from 'fs/promises'
import path from 'path'

export interface UploadResult {
  key: string
  url: string
}

export interface StorageProvider {
  upload(file: Buffer, contentType: string, userId: string): Promise<UploadResult>
  delete(key: string): Promise<void>
  getSignedUrl(key: string, expiresIn?: number): Promise<string>
}

// S3-compatible storage (Cloudflare R2, AWS S3)
class S3Storage implements StorageProvider {
  private client: S3Client
  private bucket: string
  private publicUrl: string

  constructor() {
    const endpoint = process.env.S3_ENDPOINT
    const accessKeyId = process.env.S3_ACCESS_KEY_ID
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY
    this.bucket = process.env.S3_BUCKET || 'matchmade-photos'
    this.publicUrl = process.env.S3_PUBLIC_URL || ''

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error('S3 storage not configured. Set S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY')
    }

    this.client = new S3Client({
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      region: 'auto', // R2 uses 'auto'
    })
  }

  async upload(file: Buffer, contentType: string, userId: string): Promise<UploadResult> {
    const ext = contentType.split('/')[1] || 'jpg'
    const key = `photos/${userId}/${randomUUID()}.${ext}`

    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    }))

    const url = this.publicUrl ? `${this.publicUrl}/${key}` : await this.getSignedUrl(key)

    return { key, url }
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }))
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })
    return getSignedUrl(this.client, command, { expiresIn })
  }
}

// Local filesystem storage (development only)
class LocalStorage implements StorageProvider {
  private uploadDir: string
  private publicPath: string

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads', 'photos')
    this.publicPath = '/uploads/photos'
  }

  async upload(file: Buffer, contentType: string, userId: string): Promise<UploadResult> {
    const ext = contentType.split('/')[1] || 'jpg'
    const filename = `${randomUUID()}.${ext}`
    const userDir = path.join(this.uploadDir, userId)
    const filePath = path.join(userDir, filename)
    const key = `${userId}/${filename}`

    // Ensure directory exists
    await fs.mkdir(userDir, { recursive: true })
    await fs.writeFile(filePath, file)

    const url = `${this.publicPath}/${key}`
    return { key, url }
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.uploadDir, key)
    try {
      await fs.unlink(filePath)
    } catch (err) {
      // Ignore if file doesn't exist
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw err
      }
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    // Local storage just returns the public path
    return `${this.publicPath}/${key}`
  }
}

// Factory function - returns appropriate storage provider
let storageInstance: StorageProvider | null = null

export function getStorage(): StorageProvider {
  if (storageInstance) return storageInstance

  // Use S3 if configured, otherwise fall back to local
  if (process.env.S3_ENDPOINT) {
    storageInstance = new S3Storage()
  } else {
    console.warn('S3 not configured, using local filesystem storage (dev only)')
    storageInstance = new LocalStorage()
  }

  return storageInstance
}

// Validation helpers
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function validateImage(file: Buffer, contentType: string): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(contentType)) {
    return { valid: false, error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` }
  }

  if (file.length > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB` }
  }

  return { valid: true }
}
