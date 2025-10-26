"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Upload, Trash2, FileText, Loader2, Cloud } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


export default function Home() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch uploaded documents
  useEffect(() => {
    axios
      .get(`${NEXT_PUBLIC_BACKEND_URL}/documents`)
      .then((res) => setUploadedDocs(res.data.documents))
      .catch(() => toast.error("Failed to load documents"))
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
  };
  const handleDragOver = (e) => e.preventDefault();

  const handleUpload = async () => {
    if (!file) return toast.error("Please select a file first!");
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${NEXT_PUBLIC_BACKEND_URL}/documents/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (evt) => {
            const percent = Math.round((evt.loaded * 100) / evt.total);
            setProgress(percent);
          },
        }
      );
      toast.success("File uploaded successfully!");
      setUploadedDocs([...uploadedDocs, res.data]);
      setFile(null);
    } catch (err) {
      toast.error("Upload failed: " + (err.response?.data?.detail || "Error"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this document?")) return;
    try {
      await axios.delete(`${NEXT_PUBLIC_BACKEND_URL}/documents/${id}`);
      setUploadedDocs(uploadedDocs.filter((d) => d.document_id !== id));
      toast.success("Document deleted!");
    } catch {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="text-center mt-6 mb-8 w-full max-w-3xl px-3">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-700 mb-3 tracking-tight">
          Smart Document Q&A Assistant
        </h1>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">
          Upload your PDFs or text files and get instant AI-powered insights — anywhere, anytime.
        </p>
      </header>

      {/* Upload Section */}
      <section
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-lg border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all duration-300 text-center"
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 animate-pulse" />
          <p className="text-gray-700 font-semibold text-base sm:text-lg">
            Drag & Drop your PDF or TXT files here
          </p>
          <p className="text-gray-500 text-xs sm:text-sm">
            or select one manually below
          </p>

          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            className="mt-2 border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-3/4 md:w-2/3 focus:ring-2 focus:ring-blue-400 outline-none text-sm sm:text-base"
          />

          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`w-full sm:w-3/4 md:w-2/3 py-2 sm:py-3 rounded-lg font-semibold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
              uploading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Uploading...
              </>
            ) : (
              <>
                <Cloud className="w-5 h-5" />
                Upload File
              </>
            )}
          </button>

          {uploading && (
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </section>

      {/* Uploaded Documents */}
      <section className="mt-12 w-full max-w-3xl px-3">
        <h3 className="font-semibold text-xl sm:text-2xl text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          Uploaded Documents
        </h3>

        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="animate-spin text-blue-500 w-6 h-6" />
          </div>
        ) : uploadedDocs.length === 0 ? (
          <p className="text-gray-500 text-center text-sm sm:text-base">
            No documents uploaded yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {uploadedDocs.map((doc) => (
              <li
                key={doc.document_id}
                className="group p-4 sm:p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition">
                        {doc.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.uploaded_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
                    <button
                      onClick={() => (window.location.href = `/qa?doc=${doc.document_id}`)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-100 text-blue-700 rounded-md text-xs sm:text-sm font-semibold hover:bg-blue-200 transition"
                    >
                      Ask
                    </button>
                  
                    <button
                      onClick={() => handleDelete(doc.document_id)}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-100 text-red-700 rounded-md text-xs sm:text-sm font-semibold hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-12 text-center text-gray-400 text-xs sm:text-sm pb-4">
        Built with ❤️ by <span className="font-medium text-blue-600">Abhay Katoch</span>
      </footer>
    </div>
  );
}
