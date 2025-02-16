import React, { useState } from "react";
import axios from "axios";

const VideoEmbedGenerator = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [localFile, setLocalFile] = useState(null);
  const [embedCode, setEmbedCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const redirectUrl = "https://your-redirect-link.com";
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
  
    if (!file || !file.type.startsWith("video/")) {
      setError("Please select a valid video file");
      return;
    }
  
 
    const videoURL = URL.createObjectURL(file);
    const videoElement = document.createElement("video");
  
    videoElement.src = videoURL;
    videoElement.preload = "metadata";
  
    videoElement.onloadedmetadata = async () => {
      window.URL.revokeObjectURL(videoURL);
  
      if (videoElement.duration > 10) {
        setError("❌ Video must be 10 seconds or less.");
        return;
      }
  
      const formData = new FormData();
      formData.append("video", file);
  
      try {
        setLoading(true);
        setError("");
  
        const uploadResponse = await axios.post(
          "http://localhost:3000/api/upload",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
  
        const embedResponse = await axios.post(
          "http://localhost:3000/api/generate-embed",
          { videoUrl: uploadResponse.data.videoUrl, platform: "local" }
        );
  
        setEmbedCode(embedResponse.data.embedCode);
        setLocalFile(file);
        setVideoUrl("");
      } catch (err) {
        setError("Upload failed");
      } finally {
        setLoading(false);
      }
    };
  };
  
  const generateEmbedCode = async () => {
    if (!videoUrl.trim()) {
      setError("Please enter a valid video URL");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const platform = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")
        ? "youtube"
        : videoUrl.includes("dailymotion.com")
          ? "dailymotion"
          : null;

      if (!platform) {
        setError("Unsupported video platform");
        return;
      }

      const response = await axios.post("http://localhost:3000/api/generate-embed", {
        videoUrl,
        platform,
      });

      setEmbedCode(response.data.embedCode);
    } catch (err) {
      setError("Unable to generate embed code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          🎥 Video Embed Generator
        </h1>

        <div className="mb-4">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => {
              setVideoUrl(e.target.value);
              setLocalFile(null);
              setEmbedCode("");
            }}
            placeholder="Enter YouTube or Dailymotion URL"
            className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex items-center mt-4">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
              id="fileUpload"
            />
            <label
              htmlFor="fileUpload"
              className="bg-gray-600 text-white px-2 py-2 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition"
            >
              📁 Upload Local Video
            </label>
            <button
              onClick={generateEmbedCode}
              className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition"
            >
              🔗 Generate Embed
            </button>
          </div>
        </div>

        {loading && <div className="text-blue-500 mb-4">⏳ Generating...</div>}
        {error && <div className="text-red-500 mb-4">❌ {error}</div>}

        {embedCode && (
          <div className="relative mt-6">
            <h2 className="text-xl font-semibold mb-2">🎬 Embed Code:</h2>
            <textarea
              readOnly
              value={embedCode}
              className="w-full border p-3 rounded-lg shadow-sm bg-gray-100"
              rows={3}
            />

            <h2 className="text-xl font-semibold mt-4 mb-2">📺 Preview:</h2>
            <div className="relative flex items-center justify-center bg-gray-200 p-4 rounded-lg shadow-lg">
             
              <div
                className="w-full max-w-lg"
                dangerouslySetInnerHTML={{ __html: embedCode }}
              />
            
              <a
                href={redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 bg-green-500 text-white px-3 py-2 rounded-full shadow-lg hover:bg-green-600 transition"
              >
                ➡️ Visit
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoEmbedGenerator;
