import { useEffect, useState } from "react";

export function Sidebar({ setUploadedFileName, loadFileContent }: { setUploadedFileName: (url: string) => void; loadFileContent: () => void }) {

    const [files, setFiles] = useState<{ name: string; size: number; url: string; thumbnail: string }[]>([]);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await fetch("/api/uploads/list");
                const data = await response.json();
                setFiles(data.files);
                console.log("Uploaded files:", data.files);
            } catch (error) {
                console.error("Error fetching files:", error);
            }
        };

        fetchFiles();
    }, []);

  return (
     <aside className="fixed top-0 right-0 z-20 h-screen w-full max-w-sm bg-[#2c2c2a] p-6 shadow-xl overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Uploaded Files</h2>
      <ul className="space-y-2">
        {files.map((file, index) => (
          <li key={index} className="bg-[#3a3a38] p-3 rounded-md" onClick={() => {
            setUploadedFileName(file.name);
          }}>
            <img src={file.thumbnail} alt="File Icon" className="w-6 h-6 inline-block mr-2" />
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
