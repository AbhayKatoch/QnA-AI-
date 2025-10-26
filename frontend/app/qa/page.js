"use client";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Loader2,
  Send,
  MessageCircle,
  Clock,
  BookOpen,
  FileText,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

// 🧩 Utility for chunk text formatting
function FormattedChunkText({ text }) {
  if (!text) return null;

  const formatted = text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .replace(/\•/g, "\n• ")
    .replace(/\n{2,}/g, "\n")
    .trim();

  const lines = formatted.split(/[\n•]/).filter((l) => l.trim());

  return (
    <div className="text-gray-800 text-sm leading-relaxed break-words">
      {lines.map((line, i) => (
        <p key={i} className="mb-1">
          {text.includes("•") && (
            <span className="text-green-600 font-semibold mr-1">•</span>
          )}
          {line.trim()}
        </p>
      ))}
    </div>
  );
}

// ✨ Shimmer Loader Component (for AI thinking)
function ShimmerLoader() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      <div className="h-4 bg-gray-200 rounded w-3/6"></div>
    </div>
  );
}

export default function QAInterface() {
  const searchParams = useSearchParams();
  const queryDocId = searchParams.get("doc");

  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(queryDocId || "");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const answerRef = useRef(null);

  // Fetch documents
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/documents")
      .then((res) => setDocuments(res.data.documents))
      .catch(() => toast.error("Failed to load documents"));
  }, []);

  // Load chat history
  useEffect(() => {
    if (selectedDoc) {
      axios
        .get(`http://127.0.0.1:8000/api/documents/${selectedDoc}/history`)
        .then((res) => setHistory([...res.data].reverse()))
        .catch(() => {});
    }
  }, [selectedDoc]);

  // ✅ Streaming with minimal re-renders
  const streamAnswer = (fullText) => {
    let chunk = "";
    let i = 0;
    setAnswer("");
    const interval = setInterval(() => {
      chunk += fullText[i];
      if (i % 10 === 0 || i === fullText.length - 1) {
        setAnswer(chunk);
      }
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 10);
  };

  const handleAsk = async () => {
    if (!selectedDoc) return toast.error("Select a document first!");
    if (!question.trim()) return toast.error("Enter a question!");

    setLoading(true);
    setThinking(true);
    setAnswer("");
    setSources([]);

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/documents/query`,
        null,
        { params: { document_id: selectedDoc, question } }
      );

      setThinking(false);
      const { answer, sources: src } = res.data;
      streamAnswer(answer || "No response generated.");
      setSources(src || []);

      axios
        .get(`http://127.0.0.1:8000/api/documents/${selectedDoc}/history`)
        .then((res) => setHistory([...res.data].reverse()));

      toast.success("Answer generated!");
    } catch {
      toast.error("Failed to get answer");
      setThinking(false);
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4 sm:px-8">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-extrabold text-blue-700 text-center mb-10">
        Smart Document Q&A Assistant
      </h1>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto w-full">
  {/* LEFT COLUMN: Input + History */}
  <div className="w-full lg:w-1/2 flex flex-col gap-6">
    {/* Document Selector */}
    <Card className="border border-blue-100 shadow-md">
      <CardHeader>
        <CardTitle className="text-blue-700 text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" /> Select Document
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedDoc} onValueChange={setSelectedDoc}>
          <SelectTrigger className="w-full border-gray-300 focus:ring-blue-400">
            <SelectValue placeholder="Choose a document" />
          </SelectTrigger>
          <SelectContent>
            {documents.length > 0 ? (
              documents.map((doc) => (
                <SelectItem key={doc.document_id} value={doc.document_id}>
                  {doc.filename}
                </SelectItem>
              ))
            ) : (
              <SelectItem disabled>No documents found</SelectItem>
            )}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>

    {/* Question Input */}
    <Card className="border border-blue-100 shadow-md">
      <CardHeader>
        <CardTitle className="text-blue-700 text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Ask a Question
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Type your question here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          className="resize-none border-gray-300 focus:ring-blue-400"
        />
        <Button
          disabled={loading}
          onClick={handleAsk}
          className="w-full mt-3 bg-blue-600 hover:bg-blue-700 transition"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4 mr-2" /> Generating...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" /> Ask
            </>
          )}
        </Button>
      </CardContent>
    </Card>

    {/* History */}
    <Card className="border border-gray-200 bg-gray-50 shadow-sm flex-grow">
      <CardHeader>
        <CardTitle className="text-gray-700 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" /> Conversation History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm">No previous interactions yet.</p>
        ) : (
          <ScrollArea className="h-64 pr-2">
            {history.map((item, i) => (
              <div
                key={i}
                className="mb-3 p-2 rounded-md hover:bg-gray-100 transition"
              >
                <p className="font-semibold text-gray-800 text-sm">
                  Q: {item.question}
                </p>
                <p className="text-gray-700 text-sm mt-1">
                  A: {item.answer}
                </p>
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.time?.toFixed(2)}s
                </div>
              </div>
            ))}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  </div>

  {/* RIGHT COLUMN: AI Answer + Sources */}
  <div className="w-full lg:w-1/2 flex flex-col gap-6">
    {/* AI Answer */}
    <Card className="border border-blue-100 bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-blue-700 flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> AI-Generated Answer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-72 overflow-hidden">
          <ScrollArea className="h-full p-3">
            {thinking ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                <div className="h-4 bg-gray-200 rounded w-3/6"></div>
              </div>
            ) : answer ? (
              <p
                className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words max-w-full text-justify transition-all duration-200 ease-in-out"
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  hyphens: "auto",
                }}
              >
                {answer}
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FileText className="w-10 h-10 mb-2 text-gray-300" />
                <p className="text-sm">
                  Ask a question to see the AI’s response ✨
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>

    {/* Source References (Accordion) */}
    {sources.length > 0 && (
      <Card className="border border-green-100 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-green-700 text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Source References
          </CardTitle>
          <p className="text-xs text-gray-500 mt-1">
            Extracted chunks from your document used to generate the answer.
          </p>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-72 pr-2">
            <div className="space-y-3">
              {sources.map((src, i) => (
                <details
                  key={i}
                  className="group border border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-white hover:shadow-sm transition-all overflow-hidden"
                >
                  <summary className="cursor-pointer select-none px-4 py-3 font-semibold text-green-700 flex items-center justify-between hover:bg-green-100/60 rounded-t-xl transition-all">
                    <span>Chunk {i + 1}</span>
                    <span className="text-gray-400 group-open:rotate-180 transform transition-transform duration-200">
                      ▼
                    </span>
                  </summary>

                  <div
                    className="px-4 py-3 border-t border-green-100 text-gray-800 text-sm leading-relaxed break-words whitespace-pre-wrap"
                    style={{
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      hyphens: "auto",
                    }}
                  >
                    <FormattedChunkText text={src.chunk_text} />
                  </div>
                </details>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    )}
  </div>
</div>


      <footer className="mt-12 text-center text-gray-400 text-sm">
        Built with ❤️ by Abhay Katoch
      </footer>
    </div>
  );
}
