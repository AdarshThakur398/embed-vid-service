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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 p-8 animate-gradient-x">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-10 transform transition-all hover:shadow-3xl duration-300">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 text-center mb-10 animate-pulse">
          🎬 Video Embed Generator
        </h1>

        <div className="space-y-8">
      
          <div className="group relative">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                setLocalFile(null);
                setEmbedCode("");
              }}
              placeholder="Enter YouTube or Dailymotion URL"
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 group-hover:border-purple-300"
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              <span className="text-2xl">🌐</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <label className="relative cursor-pointer">
              <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
              <div className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                <span className="text-2xl">📤</span>
                <span className="font-semibold">Upload Video</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              </div>
            </label>

            <button
              onClick={generateEmbedCode}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            >
              <span className="text-2xl">✨</span>
              <span className="font-semibold">Generate Embed</span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
            </button>
          </div>

          <div className="border-4 border-dashed border-purple-200 rounded-2xl p-8 text-center group transition-colors hover:border-purple-300">
            <div className="text-4xl mb-4">📁</div>
            <p className="text-gray-600 font-medium">
              Drag and drop your video file here
              <br />
              <span className="text-sm text-gray-400">(Max 10 seconds, MP4/WebM)</span>
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-3 text-purple-600">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="font-medium">Generating Magic Embed Code...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 bg-red-100 p-5 rounded-xl border border-red-200">
              <span className="text-2xl text-red-500">⚠️</span>
              <span className="text-red-600 font-medium">{error}</span>
            </div>
          )}

          {embedCode && (
            <div className="space-y-8 mt-10 animate-fade-in">
              <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <span className="text-2xl">🔮</span>
                  Embed Code:
                </h3>
                <pre className="p-5 bg-gray-800 rounded-lg overflow-x-auto">
                  <code className="text-sm text-green-400 font-mono">
                    {embedCode}
                  </code>
                </pre>
              </div>

              <div className="relative bg-gray-900 p-8 rounded-2xl shadow-xl">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl">📺</span>
                  Live Preview:
                </h3>
                <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: embedCode }}
                  />
                </div>
                
                <a
                  href={redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute -top-4 -right-4 bg-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                >
                  <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent font-bold">
                    Visit Portfolio ➔
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-10 rounded-full transition-opacity" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default VideoEmbedGenerator;
