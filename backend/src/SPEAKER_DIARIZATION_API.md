# Speaker Diarization API

Production-ready API for extracting and separating speakers from video/audio files using Deepgram AI.

---

## 🚀 Features

- ✅ Upload video or audio files via API
- ✅ Automatic speaker detection and separation using Deepgram
- ✅ Returns separate audio files for each speaker
- ✅ Suitable for voice cloning with ElevenLabs
- ✅ Automatic cleanup of temporary files
- ✅ User-specific file isolation
- ✅ Secure file downloads
- ✅ Environment-based configuration

---

## 📋 Setup

### 1. Environment Variables

Add to your `.env` file:

```env
DEEPGRAM_API_KEY=your-deepgram-api-key-here
```

Get your API key from: https://deepgram.com/

### 2. Install Dependencies

All dependencies are already included in `package.json`:
- `multer` - File upload handling
- `axios` - HTTP requests to Deepgram
- `fluent-ffmpeg` - Audio processing
- `fs-extra` - File system operations

### 3. Ensure ffmpeg is Installed

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Verify installation
ffmpeg -version
```

---

## 🔌 API Endpoints

### 1. Analyze Video/Audio for Speakers

**POST** `/api/speaker-diarization/analyze`

Upload a video or audio file and get speaker-separated audio files.

#### Request

- **Method:** POST
- **Content-Type:** multipart/form-data
- **Authentication:** Required (JWT token)
- **Body:**
  - `file` (required): Video or audio file
  - `saveResponse` (optional): `true` to save Deepgram response for debugging

#### Supported File Types

**Video:** mp4, mpeg, quicktime, avi, webm  
**Audio:** mp3, wav, mp4, webm, ogg

#### Max File Size

100 MB

#### Response

```json
{
  "success": true,
  "speakerCount": 3,
  "speakers": ["SPK_0", "SPK_1", "SPK_2"],
  "duration": 798.98,
  "outputFiles": [
    {
      "speaker": "SPK_0",
      "path": "uploads/speakers/user123/1234567890/SPK_0_merged.wav",
      "size": "10.10",
      "duration": "330.89",
      "segments": 116
    },
    {
      "speaker": "SPK_1",
      "path": "uploads/speakers/user123/1234567890/SPK_1_merged.wav",
      "size": "0.34",
      "duration": "11.10",
      "segments": 4
    },
    {
      "speaker": "SPK_2",
      "path": "uploads/speakers/user123/1234567890/SPK_2_merged.wav",
      "size": "9.81",
      "duration": "321.34",
      "segments": 108
    }
  ]
}
```

#### Example (cURL)

```bash
curl -X POST http://localhost:5001/api/speaker-diarization/analyze \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/video.mp4" \
  -F "saveResponse=true"
```

#### Example (JavaScript/Fetch)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('saveResponse', 'true');

const response = await fetch('http://localhost:5001/api/speaker-diarization/analyze', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(`Found ${result.speakerCount} speakers`);
```

---

### 2. Download Speaker Audio File

**GET** `/api/speaker-diarization/download/:userId/:timestamp/:filename`

Download a specific speaker's audio file.

#### Request

- **Method:** GET
- **Authentication:** Required (JWT token)
- **URL Parameters:**
  - `userId`: User ID (from analyze response path)
  - `timestamp`: Timestamp (from analyze response path)
  - `filename`: File name (e.g., `SPK_0_merged.wav`)

#### Response

Binary audio file (WAV format, 16kHz, mono)

#### Example

```bash
curl -X GET http://localhost:5001/api/speaker-diarization/download/user123/1234567890/SPK_0_merged.wav \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o speaker_0.wav
```

---

### 3. Cleanup Speaker Files

**DELETE** `/api/speaker-diarization/cleanup/:userId/:timestamp`

Delete all speaker files for a specific analysis session.

#### Request

- **Method:** DELETE
- **Authentication:** Required (JWT token)
- **URL Parameters:**
  - `userId`: User ID
  - `timestamp`: Timestamp

#### Response

```json
{
  "success": true,
  "message": "Files cleaned up successfully"
}
```

#### Example

```bash
curl -X DELETE http://localhost:5001/api/speaker-diarization/cleanup/user123/1234567890 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 How It Works

1. **Upload**: User uploads video/audio file via API
2. **Extract**: Audio is extracted from video (if needed) using ffmpeg
3. **Analyze**: Audio is sent to Deepgram for speaker diarization
4. **Segment**: Each speaker's words are identified with timestamps
5. **Split**: Audio is split into segments for each speaker
6. **Merge**: All segments for each speaker are merged into one file
7. **Cleanup**: Temporary files are automatically deleted
8. **Return**: API returns paths to speaker audio files

---

## 🎙️ Output Format

All speaker audio files are in WAV format with:
- **Sample Rate:** 16kHz
- **Channels:** Mono (1 channel)
- **Bit Depth:** 16-bit PCM
- **Format:** WAV

This format is optimized for:
- ElevenLabs voice cloning
- Speech recognition
- Voice analysis

---

## 🔒 Security

- ✅ **Authentication Required**: All endpoints require valid JWT token
- ✅ **User Isolation**: Users can only access their own files
- ✅ **File Type Validation**: Only video/audio files accepted
- ✅ **File Size Limits**: 100MB maximum
- ✅ **Automatic Cleanup**: Temporary files are deleted after processing

---

## ⚠️ Error Handling

### Common Errors

#### 400 Bad Request
```json
{
  "success": false,
  "error": "No file uploaded. Please upload a video or audio file."
}
```
**Solution:** Ensure you're sending a file in the `file` field

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Deepgram API key not configured. Please set DEEPGRAM_API_KEY in environment variables."
}
```
**Solution:** Add `DEEPGRAM_API_KEY` to your `.env` file

#### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied"
}
```
**Solution:** You can only download your own files

#### 404 Not Found
```json
{
  "success": false,
  "error": "File not found"
}
```
**Solution:** File may have been deleted or path is incorrect

---

## 💡 Tips for Best Results

### Audio Quality
- Use clear audio with minimal background noise
- Ensure speakers have distinct voices
- Longer audio (2+ minutes) works better than short clips

### Speaker Detection
- Deepgram works best with 2-5 speakers
- Very similar voices may be grouped together
- Background noise can be detected as a speaker

### Voice Cloning
- Minimum 1 minute of audio per speaker recommended
- 2-5 minutes per speaker is ideal
- Use the longest speaker files for best cloning results

---

## 🧪 Testing

### Test with cURL

```bash
# 1. Upload and analyze
curl -X POST http://localhost:5001/api/speaker-diarization/analyze \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-video.mp4" \
  > result.json

# 2. Extract file path from result
cat result.json | jq -r '.outputFiles[0].path'

# 3. Download speaker file
curl -X GET http://localhost:5001/api/speaker-diarization/download/USER_ID/TIMESTAMP/SPK_0_merged.wav \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o speaker_0.wav

# 4. Cleanup
curl -X DELETE http://localhost:5001/api/speaker-diarization/cleanup/USER_ID/TIMESTAMP \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📁 File Structure

```
backend/
├── src/
│   ├── services/
│   │   └── speakerDiarization.js    # Core service logic
│   ├── routes/
│   │   └── speakerDiarization.js    # API routes
│   └── SPEAKER_DIARIZATION_API.md   # This documentation
├── uploads/
│   ├── diarization/                 # Temporary uploaded files
│   ├── speakers/                    # Final speaker audio files
│   │   └── {userId}/
│   │       └── {timestamp}/
│   │           ├── SPK_0_merged.wav
│   │           ├── SPK_1_merged.wav
│   │           └── deepgram_response.json
│   └── temp/                        # Temporary processing files (auto-deleted)
```

---

## 🆘 Troubleshooting

### ffmpeg not found
```bash
# macOS
brew install ffmpeg

# Add to PATH
export PATH="/opt/homebrew/bin:$PATH"
```

### Deepgram API errors
- Check your API key is valid
- Ensure you have credits remaining
- Verify audio file is not corrupted

### No speakers detected
- Audio might not contain speech
- Try a different video with clear dialogue
- Check Deepgram response JSON for details

### Only 1 speaker detected
- Speakers might sound too similar
- Audio might be too short
- One speaker might dominate the conversation

---

## 📚 Related Documentation

- [Deepgram API Docs](https://developers.deepgram.com/)
- [ElevenLabs Voice Cloning](https://elevenlabs.io/docs/voice-cloning)
- [ffmpeg Documentation](https://ffmpeg.org/documentation.html)

