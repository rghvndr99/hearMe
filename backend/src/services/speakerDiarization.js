import fs from "fs-extra";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set ffmpeg path (try common locations)
try {
  const ffmpegPath = execSync('which ffmpeg', { encoding: 'utf8' }).trim();
  if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
    console.log(`✅ ffmpeg found at: ${ffmpegPath}`);
  }
} catch (err) {
  // Try common macOS Homebrew path
  const homebrewPath = '/opt/homebrew/bin/ffmpeg';
  if (fs.existsSync(homebrewPath)) {
    ffmpeg.setFfmpegPath(homebrewPath);
    console.log(`✅ ffmpeg found at: ${homebrewPath}`);
  } else {
    console.warn('⚠️  ffmpeg not found in PATH. Please install ffmpeg or set PATH.');
  }
}

/**
 * Speaker Diarization Service
 * Extracts audio from video/audio files and separates speakers using Deepgram AI
 */

/**
 * Extract audio from video file
 * @param {string} inputPath - Path to input video/audio file
 * @param {string} outputPath - Path to save extracted audio
 * @returns {Promise<void>}
 */
export async function extractAudio(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .noVideo()
      .audioCodec("pcm_s16le")
      .audioChannels(1)
      .audioFrequency(16000)
      .save(outputPath)
      .on("end", () => {
        console.log("✅ Audio extracted:", outputPath);
        resolve();
      })
      .on("error", reject);
  });
}

/**
 * Send audio to Deepgram for speaker diarization
 * @param {string} audioPath - Path to audio file
 * @param {string} apiKey - Deepgram API key
 * @returns {Promise<Object>} Deepgram response
 */
export async function analyzeWithDeepgram(audioPath, apiKey) {
  console.log("📤 Uploading to Deepgram for diarization...");

  const apiUrl = `https://api.deepgram.com/v1/listen?model=nova-2&diarize=true&punctuate=true&utterances=true&detect_language=true`;

  const res = await axios.post(
    apiUrl,
    fs.createReadStream(audioPath),
    {
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "audio/wav",
      },
    }
  );

  console.log("✅ Deepgram diarization completed!");
  return res.data;
}

/**
 * Extract speaker segments from Deepgram response
 * @param {Object} result - Deepgram API response
 * @returns {Object} Speaker segments { SPK_0: [{start, end}, ...], SPK_1: [...], ... }
 */
export function extractSpeakerSegments(result) {
  const speakers = {};

  if (!result.results?.channels?.length) {
    throw new Error("No transcription channels found in Deepgram response.");
  }

  const items = result.results.channels[0].alternatives[0].words;

  console.log(`\n📊 Total words detected: ${items.length}`);

  // Check if speaker diarization worked
  const uniqueSpeakers = new Set();
  const speakerWordCounts = {};

  items.forEach(word => {
    if (word.speaker !== undefined) {
      uniqueSpeakers.add(word.speaker);
      speakerWordCounts[word.speaker] = (speakerWordCounts[word.speaker] || 0) + 1;
    }
  });

  console.log(`🎙️  Unique speakers detected: ${uniqueSpeakers.size}`);
  console.log(`🎙️  Speaker IDs: ${Array.from(uniqueSpeakers).join(', ')}`);

  // Show word count per speaker
  console.log('\n📊 Words per speaker:');
  Object.entries(speakerWordCounts).forEach(([speaker, count]) => {
    const percentage = ((count / items.length) * 100).toFixed(1);
    console.log(`   Speaker ${speaker}: ${count} words (${percentage}%)`);
  });

  if (uniqueSpeakers.size === 0) {
    console.warn("\n⚠️  WARNING: No speaker information found in Deepgram response!");
    console.warn("⚠️  This might mean:");
    console.warn("   - Only one speaker in the audio");
    console.warn("   - Audio quality too poor for diarization");
    console.warn("   - Deepgram API key doesn't have diarization enabled");
  }

  // Extract speaker segments
  for (const word of items) {
    const speaker = `SPK_${word.speaker !== undefined ? word.speaker : 0}`;
    if (!speakers[speaker]) speakers[speaker] = [];
    speakers[speaker].push({ start: word.start, end: word.end });
  }

  console.log(`\n📋 Speaker segments extracted:`);
  Object.entries(speakers).forEach(([speaker, segments]) => {
    console.log(`   ${speaker}: ${segments.length} segments`);
  });

  return speakers;
}

/**
 * Split and merge audio by speaker
 * @param {string} audioPath - Path to source audio file
 * @param {Object} speakers - Speaker segments from extractSpeakerSegments
 * @param {string} outputDir - Directory to save final speaker audio files
 * @param {string} tempDir - Directory for temporary files
 * @returns {Promise<Array>} Array of output file paths
 */
export async function splitAndMergeSpeakers(audioPath, speakers, outputDir, tempDir) {
  await fs.ensureDir(tempDir);
  await fs.ensureDir(outputDir);

  const outputFiles = [];

  for (const [speaker, segments] of Object.entries(speakers)) {
    console.log(`🎙 Processing ${speaker}...`);
    const tempFiles = [];

    // Merge close segments (<0.5s apart)
    const merged = [];
    let current = segments[0];
    for (let i = 1; i < segments.length; i++) {
      if (segments[i].start - current.end < 0.5) {
        current.end = segments[i].end;
      } else {
        merged.push(current);
        current = segments[i];
      }
    }
    merged.push(current);

    // Extract and save each merged segment
    for (let i = 0; i < merged.length; i++) {
      const seg = merged[i];
      const output = path.join(tempDir, `${speaker}_${i}.wav`);
      await new Promise((resolve, reject) => {
        ffmpeg(audioPath)
          .setStartTime(seg.start)
          .setDuration(seg.end - seg.start)
          .output(output)
          .on("end", resolve)
          .on("error", reject)
          .run();
      });
      tempFiles.push(output);
    }

    // Merge all segments into one long voice sample
    const listFile = path.join(tempDir, `${speaker}_list.txt`);
    const listContent = tempFiles.map(f => `file '${path.basename(f)}'`).join("\n");
    fs.writeFileSync(listFile, listContent);

    const finalOutput = path.join(outputDir, `${speaker}_merged.wav`);

    // Use concat demuxer with re-encoding to ensure compatibility
    try {
      // Use absolute paths to avoid path issues
      const absoluteListFile = path.resolve(listFile);
      const absoluteOutputFile = path.resolve(finalOutput);

      execSync(
        `cd "${path.resolve(tempDir)}" && ffmpeg -y -f concat -safe 0 -i "${absoluteListFile}" -ar 16000 -ac 1 -c:a pcm_s16le "${absoluteOutputFile}"`,
        { stdio: 'inherit' }
      );

      // Get file size and duration for verification
      const stats = fs.statSync(finalOutput);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      const durationSeconds = (stats.size / (16000 * 2)).toFixed(2);

      console.log(`✅ ${speaker}: ${finalOutput}`);
      console.log(`   Size: ${sizeInMB} MB | Duration: ~${durationSeconds}s | Segments: ${tempFiles.length}`);
      
      outputFiles.push({
        speaker,
        path: finalOutput,
        size: sizeInMB,
        duration: durationSeconds,
        segments: tempFiles.length
      });
    } catch (err) {
      console.error(`❌ Error merging ${speaker}:`, err.message);
    }
  }

  return outputFiles;
}

/**
 * Clean up temporary files
 * @param {string} tempDir - Directory containing temporary files
 */
export async function cleanupTempFiles(tempDir) {
  try {
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir);
      console.log(`🧹 Cleaned up temporary files: ${tempDir}`);
    }
  } catch (err) {
    console.error(`⚠️  Failed to clean up temp files: ${err.message}`);
  }
}

/**
 * Main pipeline: Process video/audio file and extract speakers
 * @param {string} inputPath - Path to input video/audio file
 * @param {string} apiKey - Deepgram API key
 * @param {Object} options - Optional configuration
 * @param {string} options.outputDir - Directory for final speaker files (default: 'final_speakers')
 * @param {string} options.tempDir - Directory for temporary files (default: 'speakers_temp')
 * @param {boolean} options.saveResponse - Save Deepgram response to JSON (default: false)
 * @param {boolean} options.cleanup - Clean up temp files after processing (default: true)
 * @returns {Promise<Object>} Result object with speakers and output files
 */
export async function processSpeakerDiarization(inputPath, apiKey, options = {}) {
  const {
    outputDir = 'final_speakers',
    tempDir = 'speakers_temp',
    saveResponse = false,
    cleanup = true
  } = options;

  console.log("🎬 Starting speaker diarization pipeline...\n");

  // Step 1: Extract audio
  const audioPath = path.join(tempDir, 'extracted_audio.wav');
  await fs.ensureDir(tempDir);
  await extractAudio(inputPath, audioPath);

  // Step 2: Analyze with Deepgram
  const result = await analyzeWithDeepgram(audioPath, apiKey);

  // Optionally save response for debugging
  if (saveResponse) {
    const responsePath = path.join(outputDir, 'deepgram_response.json');
    await fs.ensureDir(outputDir);
    fs.writeFileSync(responsePath, JSON.stringify(result, null, 2));
    console.log(`📝 Deepgram response saved to ${responsePath}`);
  }

  // Step 3: Extract speaker segments
  const speakers = extractSpeakerSegments(result);

  const speakerCount = Object.keys(speakers).length;
  console.log(`\n✅ Found ${speakerCount} speaker(s)`);

  if (speakerCount === 0) {
    throw new Error("No speakers detected! Cannot proceed with audio splitting.");
  }

  if (speakerCount === 1) {
    console.warn("⚠️  Only 1 speaker detected.");
  }

  // Step 4: Split and merge speakers
  const outputFiles = await splitAndMergeSpeakers(audioPath, speakers, outputDir, tempDir);

  // Step 5: Cleanup
  if (cleanup) {
    await cleanupTempFiles(tempDir);
  }

  console.log("\n🎉 Pipeline completed successfully!");

  return {
    speakerCount,
    speakers: Object.keys(speakers),
    outputFiles,
    duration: result.metadata?.duration || 0
  };
}

