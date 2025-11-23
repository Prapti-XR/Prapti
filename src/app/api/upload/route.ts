import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadToR2, generatePresignedUploadUrl } from '@/lib/upload';
import { generateAssetKey } from '@/lib/r2';
import { serializeBigInt } from '@/lib/utils';

/**
 * POST /api/upload
 * Upload assets (3D models, panoramas, images) to R2 storage
 * Requires authentication
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Check if user is admin or moderator for asset uploads
    if (!['ADMIN', 'MODERATOR'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const siteId = formData.get('siteId') as string;
    const assetType = formData.get('assetType') as 'models' | 'panoramas' | 'images' | 'thumbnails';
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;

    if (!file || !siteId || !assetType || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: file, siteId, assetType, title' },
        { status: 400 }
      );
    }

    // Verify site exists
    const site = await prisma.heritageSite.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json(
        { success: false, error: 'Heritage site not found' },
        { status: 404 }
      );
    }

    // Upload file to R2
    const uploadResult = await uploadToR2({
      siteId,
      assetType,
      file,
      contentType: file.type,
    });

    // Determine asset type enum
    let assetTypeEnum: 'MODEL_3D' | 'PANORAMA_360' | 'PANORAMA_180' | 'IMAGE' | 'THUMBNAIL' | 'VIDEO';
    if (assetType === 'models') {
      assetTypeEnum = 'MODEL_3D';
    } else if (assetType === 'panoramas') {
      assetTypeEnum = file.name.includes('360') ? 'PANORAMA_360' : 'PANORAMA_180';
    } else if (assetType === 'thumbnails') {
      assetTypeEnum = 'THUMBNAIL';
    } else {
      assetTypeEnum = 'IMAGE';
    }

    // Get file dimensions for images (if available)
    const width = formData.get('width') ? parseInt(formData.get('width') as string) : null;
    const height = formData.get('height') ? parseInt(formData.get('height') as string) : null;

    // Create asset record in database
    const asset = await prisma.asset.create({
      data: {
        type: assetTypeEnum,
        title,
        description,
        storageKey: uploadResult.key,
        storageUrl: uploadResult.url,
        fileSize: BigInt(uploadResult.size),
        mimeType: file.type,
        format: assetType === 'models' ? file.name.split('.').pop()?.toUpperCase() : null,
        isPanorama: assetType === 'panoramas',
        panoramaType: assetType === 'panoramas' ? (file.name.includes('360') ? '360' : '180') : null,
        width,
        height,
        isProcessed: true,
        isPublic: true,
        siteId,
        uploadedById: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: serializeBigInt({
        asset: {
          id: asset.id,
          type: asset.type,
          title: asset.title,
          storageUrl: asset.storageUrl,
          mimeType: asset.mimeType,
        },
        uploadResult,
      }),
    }, { status: 201 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload asset' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload
 * Generate presigned URL for client-side upload
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'MODERATOR'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const assetType = searchParams.get('assetType') as 'models' | 'panoramas' | 'images' | 'thumbnails';
    const filename = searchParams.get('filename');
    const contentType = searchParams.get('contentType');

    if (!siteId || !assetType || !filename || !contentType) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const key = generateAssetKey(siteId, assetType, filename);
    const presignedUrl = await generatePresignedUploadUrl(key, contentType, 3600);

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: presignedUrl,
        key,
      },
    });

  } catch (error) {
    console.error('Presigned URL generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
