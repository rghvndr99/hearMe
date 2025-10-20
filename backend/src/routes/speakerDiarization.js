import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { processSpeakerDiarization } from '../services/speakerDiarization.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/diarization';
    await fs.ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept video and audio files
    const allowedMimes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/mp3',
      'audio/mp4',
      'audio/webm',
      'audio/ogg'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video and audio files are allowed.'));
    }
  }
});

/**
 * POST /api/speaker-diarization/analyze
 * Upload a video/audio file and get speaker-separated audio files
 * 
 * Request:
 * - file: video/audio file (multipart/form-data)
 * - saveResponse: boolean (optional) - save Deepgram response for debugging
 * 
 * Response:
 * {
 *   success: true,
 *   speakerCount: 2,
 *   speakers: ['SPK_0', 'SPK_1'],
 *   duration: 54.89,
 *   outputFiles: [
 *     { speaker: 'SPK_0', path: '...', size: '1.50', duration: '49.05', segments: 213 },
 *     { speaker: 'SPK_1', path: '...', size: '0.84', duration: '27.45', segments: 122 }
 *   ]
 * }
 */
router.post('/analyze', auth, upload.single('file'), async (req, res) => {
  let uploadedFilePath = null;
  let outputDir = null;
  
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please upload a video or audio file.'
      });
    }

    uploadedFilePath = req.file.path;
    
    // Check if Deepgram API key is configured
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Deepgram API key not configured. Please set DEEPGRAM_API_KEY in environment variables.'
      });
    }

    // Create unique output directory for this user/request
    const userId = req.user?.sub || req.user?.id || 'anonymous';
    const timestamp = Date.now();
    outputDir = `uploads/speakers/${userId}/${timestamp}`;
    const tempDir = `uploads/temp/${userId}/${timestamp}`;

    // Process the file
    const saveResponse = req.body.saveResponse === 'true' || req.body.saveResponse === true;
    
    const result = await processSpeakerDiarization(uploadedFilePath, apiKey, {
      outputDir,
      tempDir,
      saveResponse,
      cleanup: true
    });

    // Clean up uploaded file
    await fs.remove(uploadedFilePath);

    // Convert file system paths to API paths
    const outputFilesWithApiPaths = result.outputFiles.map(file => {
      const filename = path.basename(file.path);
      return {
        ...file,
        path: `/api/speaker-diarization/download/${userId}/${timestamp}/${filename}`
      };
    });

    res.json({
      success: true,
      ...result,
      outputFiles: outputFilesWithApiPaths
    });

  } catch (error) {
    console.error('Speaker diarization error:', error);
    
    // Clean up on error
    if (uploadedFilePath && await fs.pathExists(uploadedFilePath)) {
      await fs.remove(uploadedFilePath);
    }
    if (outputDir && await fs.pathExists(outputDir)) {
      await fs.remove(outputDir);
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process speaker diarization'
    });
  }
});

/**
 * GET /api/speaker-diarization/download/:userId/:timestamp/:filename
 * Download a speaker audio file
 */
router.get('/download/:userId/:timestamp/:filename', auth, async (req, res) => {
  try {
    const { userId, timestamp, filename } = req.params;
    
    // Security: Ensure user can only download their own files
    const requestUserId = req.user?.sub || req.user?.id;
    if (userId !== requestUserId && userId !== 'anonymous') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const filePath = path.join('uploads', 'speakers', userId, timestamp, filename);
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.download(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download file'
    });
  }
});

/**
 * DELETE /api/speaker-diarization/cleanup/:userId/:timestamp
 * Clean up speaker files after they've been downloaded/used
 */
router.delete('/cleanup/:userId/:timestamp', auth, async (req, res) => {
  try {
    const { userId, timestamp } = req.params;
    
    // Security: Ensure user can only delete their own files
    const requestUserId = req.user?.sub || req.user?.id;
    if (userId !== requestUserId && userId !== 'anonymous') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const dirPath = path.join('uploads', 'speakers', userId, timestamp);
    
    if (await fs.pathExists(dirPath)) {
      await fs.remove(dirPath);
      res.json({
        success: true,
        message: 'Files cleaned up successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Directory not found'
      });
    }
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clean up files'
    });
  }
});

export default router;

