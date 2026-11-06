import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

/**
 * Robustly reads a local file URI (photo, video, cached image, content URI)
 * into a valid, non-empty ArrayBuffer for Supabase Storage uploads in React Native / Expo.
 */
export async function fileUriToArrayBuffer(
  fileUri: string,
  base64Data?: string | null
): Promise<ArrayBuffer> {
  // 0. If explicit base64 provided directly from ImageManipulator / ImagePicker
  if (base64Data && base64Data.length > 0) {
    const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const buffer = decode(cleanBase64);
    if (buffer.byteLength > 0) {
      return buffer;
    }
  }

  // 1. If data URI with base64 prefix
  if (fileUri.startsWith('data:')) {
    const commaIndex = fileUri.indexOf(',');
    const base64Str = commaIndex !== -1 ? fileUri.substring(commaIndex + 1) : fileUri;
    return decode(base64Str);
  }

  // 2. Primary & most reliable method in React Native Expo:
  // Read directly from filesystem as base64, then decode into ArrayBuffer
  try {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (base64 && base64.length > 0) {
      const buffer = decode(base64);
      if (buffer.byteLength > 0) {
        return buffer;
      }
    }
  } catch (fsErr) {
    console.warn('[storageUpload] FileSystem.readAsStringAsync failed, trying fallback:', fsErr);
  }

  // 3. Fallback (e.g. web or remote URIs)
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();
    if (arrayBuffer && arrayBuffer.byteLength > 0) {
      return arrayBuffer;
    }
  } catch (fetchErr) {
    console.warn('[storageUpload] Fetch fallback failed:', fetchErr);
  }

  throw new Error('Unable to read media file for upload. Please try selecting the file again.');
}
