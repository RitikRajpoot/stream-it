'use client';

import { useCallback, useEffect, useState } from "react";
import { Streamer } from "./streamer";
import { Sidebar } from "./sidebar";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("Ready to upload a file.");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string>("");

  const handleFile = (selectedFile: File | null | undefined) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    console.log("File selected:", selectedFile.name);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const droppedFile = event.dataTransfer.files?.[0];
    handleFile(droppedFile);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    handleFile(selectedFile);
  };

  const uploadFile = async () => {
    if (!file) {
      setUploadStatus("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadStatus("Uploading file...");

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setUploadedFileName(data.fileName);
      setStreamUrl(`/api/uploads/${encodeURIComponent(data.fileName)}`);
      setUploadStatus(`Uploaded successfully as ${data.fileName}`);
    } catch (error) {
      console.error(error);
      setUploadStatus("Upload failed. Please try again.");
    }
  };

  const loadFileContent = useCallback(async() => {
    if (!uploadedFileName) {
      setUploadStatus("Upload a file before fetching its content.");
      return;
    }

    try {
      const response = await fetch(`/api/uploads/${encodeURIComponent(uploadedFileName)}`);

      if (!response.ok) {
        throw new Error("Unable to load file stream");
      }

      setStreamUrl(`/api/uploads/${encodeURIComponent(uploadedFileName)}`);
      setUploadStatus(`Ready to stream ${uploadedFileName}`);
    } catch (error) {
      console.error(error);
      setUploadStatus("Could not fetch file content.");
    }
  }, [uploadedFileName]);

  useEffect(() => {
    if (uploadedFileName) {
      loadFileContent();
    }
  }, [uploadedFileName, loadFileContent]);

  return (
    <>
    <div className="relative min-h-screen overflow-x-hidden">
      <main className="min-h-screen flex items-center justify-center px-4 md:pr-80">
        {streamUrl ? (
          <Streamer uploadStatus={uploadStatus} streamUrl={streamUrl} />
        ) : null}
        {!streamUrl ?
          <div
            id="drop-zone"
            onClick={() => document.getElementById("file-input")?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={isDragOver ? "drag-over" : ""}
          >
            <input
              type="file"
              id="file-input"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <i className="ti ti-video"></i>
            <h3>Drop a video here, or click to browse</h3>
            <p>Your file never leaves your device</p>
            <p>Selected file: {file?.name ?? "No file selected"}</p>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                uploadFile();
              }}
              className="mt-4 rounded bg-blue-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!file}
            >
              Upload to server
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                loadFileContent();
              }}
              className="mt-2 rounded bg-emerald-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!uploadedFileName}
            >
              Load file content
            </button>
          </div> : null}
      </main>
    </div>
    <Sidebar setUploadedFileName={setUploadedFileName}  loadFileContent={loadFileContent}/>
  </>
  );
}
