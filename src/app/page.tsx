'use client';

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="bg-[#2c2c2a] p-10 rounded-lg shadow-md w-full max-w-md text-center">
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
        </div>
      </main>
    </div>
  );
}
