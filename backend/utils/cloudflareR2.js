import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

// Cloudflare R2 client configuration
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Upload file to Cloudflare R2
export const uploadToR2 = async (
  fileBuffer,
  fileName,
  mimeType,
  folder = 'uploads'
) => {
  try {
    const key = `${folder}/${Date.now()}-${fileName}`;

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: 'public-read', // Make files publicly accessible
      },
    });

    const result = await upload.done();

    return {
      public_id: key,
      url: `${process.env.R2_PUBLIC_URL}/${key}`,
      key: key,
    };
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload file');
  }
};

// Delete file from Cloudflare R2
export const deleteFromR2 = async (key) => {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(deleteCommand);
    return true;
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw new Error('Failed to delete file');
  }
};

// Generate signed URL for private files (if needed)
export const getSignedUrl = async (key, expiresIn = 3600) => {
  // This would require additional setup with Cloudflare R2 signed URLs
  // For now, returning public URL since we're using public-read ACL
  return `${process.env.R2_PUBLIC_URL}/${key}`;
};

export default s3Client;
