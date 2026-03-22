import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Download, 
  Share2, 
  Plus, 
  Palette, 
  Type as TypeIcon, 
  Smile, 
  BookOpen, 
  Heart, 
  Zap,
  Loader2,
  Trash2,
  Wand2,
  Copy,
  Check,
  Image as ImageIcon,
  Paperclip,
  FileText,
  FileAudio,
  File as FileIcon,
  X,
  Settings,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import mammoth from 'mammoth';
import { generatePromptDirectly, FilePart } from './services/geminiService';

const MOODS = [
  { id: 'educational', label: 'Giáo dục', icon: BookOpen, color: '#4A90E2' },
  { id: 'emotional', label: 'Cảm xúc', icon: Heart, color: '#FF6B6B' },
  { id: 'parenting', label: 'Nuôi dạy', icon: Smile, color: '#FFB347' },
  { id: 'inspiring', label: 'Truyền cảm hứng', icon: Zap, color: '#B19CD9' },
];

export default function App() {
  const [inputText, setInputText] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeMood, setActiveMood] = useState('educational');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    const envKey = import.meta.env.VITE_API_KEY;
    
    if (savedKey) {
      setApiKey(savedKey);
    } else if (envKey) {
      setApiKey(envKey);
    } else {
      setShowApiKeyModal(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (tempApiKey.trim()) {
      localStorage.setItem('gemini_api_key', tempApiKey.trim());
      setApiKey(tempApiKey.trim());
      setShowApiKeyModal(false);
      setTempApiKey("");
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim() && !selectedFile) return;
    if (!apiKey) {
      setShowApiKeyModal(true);
      return;
    }
    setIsGenerating(true);
    setImagePrompt(""); 
    try {
      let filePart: FilePart | undefined;
      let extraText = "";

      if (selectedFile) {
        if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          extraText = result.value;
        } else if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('audio/') || selectedFile.type === 'application/pdf') {
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(selectedFile);
          });
          filePart = {
            inlineData: {
              data: base64,
              mimeType: selectedFile.type
            }
          };
        }
      }

      const combinedText = inputText + (extraText ? `\n\nDocument Content:\n${extraText}` : "");
      const prompt = await generatePromptDirectly(combinedText, activeMood, apiKey, filePart);
      setImagePrompt(prompt);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD1DC', '#B2E2F2', '#C1E1C1', '#FFB347']
      });
      
      setSelectedFile(null);
      setFilePreview(null);
      setInputText("");
    } catch (error) {
      console.error("Lỗi tạo prompt:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setFilePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(imagePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMakeItCute = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      shapes: ['circle', 'square'],
      colors: ['#FF69B4', '#87CEEB', '#98FB98', '#DDA0DD']
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#FFF9F2]">
      {/* Sidebar Left: Input */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-80 glass-panel m-4 flex flex-col overflow-hidden border-r border-orange-100"
      >
        <div className="p-6 border-b border-orange-50 bg-white/50">
          <h1 className="text-2xl font-display text-orange-500 flex items-center gap-2">
            <Sparkles className="w-6 h-6" /> CuteMind AI
          </h1>
          <p className="text-xs text-gray-400 font-medium mt-1">Biến ý tưởng thành tranh vẽ đáng yêu</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
                <TypeIcon className="w-4 h-4" /> Nội dung của bạn
              </label>
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập chủ đề hoặc đính kèm tệp (Ảnh, PDF, Audio, Word)..."
                  className="w-full h-40 p-4 rounded-2xl border-2 border-orange-100 focus:border-orange-300 focus:ring-0 transition-all resize-none text-sm bg-white/50"
                />
                
                <AnimatePresence>
                  {selectedFile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute bottom-4 left-4 right-4 p-2 bg-white rounded-xl border border-orange-100 shadow-sm flex items-center gap-3 z-10"
                    >
                      {filePreview ? (
                        <img src={filePreview} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-400">
                          {selectedFile.type.startsWith('audio/') ? <FileAudio className="w-5 h-5" /> : 
                           selectedFile.type === 'application/pdf' ? <FileText className="w-5 h-5" /> : 
                           <FileIcon className="w-5 h-5" />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-gray-600 truncate">{selectedFile.name}</p>
                        <p className="text-[8px] text-gray-400 uppercase">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button 
                        onClick={removeFile}
                        className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex gap-2">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,audio/*,application/pdf,.docx"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 bg-white border-2 border-orange-100 hover:border-orange-300 text-orange-500 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Paperclip className="w-4 h-4" />
                Đính kèm
              </button>
              
              <button
                onClick={handleGenerate}
                disabled={isGenerating || (!inputText.trim() && !selectedFile)}
                className="flex-[2] py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 group"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Sinh Câu Lệnh Ảnh (Prompt)
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
              <Smile className="w-4 h-4" /> Chọn Mood
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setActiveMood(mood.id)}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                    activeMood === mood.id 
                    ? 'border-orange-400 bg-orange-50 text-orange-600' 
                    : 'border-gray-100 bg-white text-gray-400 hover:border-orange-200'
                  }`}
                >
                  <mood.icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Image Prompt Section - Simplified */}
          {imagePrompt && (
            <div className="pt-6 border-t border-orange-100 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-500" /> AI Image Prompt
                </label>
                <button
                  onClick={handleCopyPrompt}
                  className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                >
                  {copied ? (
                    <><Check className="w-3 h-3" /> Đã sao chép</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Sao chép câu lệnh</>
                  )}
                </button>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <div className="w-full p-4 bg-indigo-50/50 rounded-2xl border-2 border-indigo-100 text-xs text-indigo-900 leading-relaxed font-medium max-h-64 overflow-y-auto custom-scrollbar">
                  {imagePrompt}
                </div>
                <button
                  onClick={() => setImagePrompt("")}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 transition-all border border-gray-100"
                  title="Xóa prompt"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
              
              <p className="text-[10px] text-gray-400 italic text-center">
                Dùng câu lệnh này trên Midjourney hoặc DALL-E 3 để tạo ảnh chất lượng cao.
              </p>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Area: Result Preview */}
      <main className="flex-1 relative flex flex-col bg-white">
        <header className="h-16 flex items-center justify-between px-8 border-b border-orange-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" />
            <span className="font-display text-lg text-gray-700">Kết quả của bạn</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowApiKeyModal(true)}
              className="px-4 py-2 bg-white border-2 border-orange-100 hover:border-orange-300 text-gray-600 rounded-full text-sm font-bold flex flex-col items-center transition-all shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> Settings (API Key)
              </div>
              <span className="text-[9px] text-red-500 font-medium">Lấy API key để sử dụng app</span>
            </button>
            <button 
              onClick={handleMakeItCute}
              className="px-4 py-2 bg-pink-400 hover:bg-pink-500 text-white rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-md shadow-pink-100"
            >
              <Heart className="w-4 h-4" /> Make it cute!
            </button>
          </div>
        </header>

        <div className="flex-1 p-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!imagePrompt ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6 max-w-md"
              >
                <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Wand2 className="w-16 h-16 text-orange-200" />
                </div>
                <h2 className="text-2xl font-display text-gray-800">Sẵn sàng tạo câu lệnh?</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Nhập nội dung hoặc đính kèm tệp ở bên trái, sau đó nhấn nút <b>"Sinh Câu Lệnh Ảnh"</b> để bắt đầu.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl glass-panel p-10 space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-500">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">AI Image Prompt</h3>
                      <p className="text-[10px] text-gray-400 font-medium">Sao chép và dán vào công cụ tạo ảnh</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyPrompt}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                      copied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Đã sao chép' : 'Sao chép ngay'}
                  </button>
                </div>

                <div className="p-8 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 text-lg text-gray-700 leading-relaxed font-medium italic">
                  "{imagePrompt}"
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="p-4 bg-orange-50 rounded-2xl flex flex-col items-center text-center gap-2">
                    <Palette className="w-5 h-5 text-orange-400" />
                    <span className="text-[10px] font-bold text-orange-700 uppercase">Màu sắc rực rỡ</span>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl flex flex-col items-center text-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-700 uppercase">Phong cách Cute</span>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-2xl flex flex-col items-center text-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    <span className="text-[10px] font-bold text-purple-700 uppercase">Dễ hiểu cho bé</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* API Key Modal */}
      <AnimatePresence>
        {showApiKeyModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-display text-gray-800">Cấu hình API Key</h3>
                      <p className="text-xs text-gray-400">Yêu cầu để sử dụng các tính năng AI</p>
                    </div>
                  </div>
                  {apiKey && (
                    <button 
                      onClick={() => setShowApiKeyModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
                    <p className="text-xs text-blue-700 leading-relaxed font-medium">
                      Bạn cần có Gemini API Key để ứng dụng có thể hoạt động. API key này sẽ được lưu an toàn trong trình duyệt của bạn.
                    </p>
                    <a 
                      href="https://aistudio.google.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                    >
                      Lấy API key tại Google AI Studio <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Gemini API Key</label>
                    <input 
                      type="password"
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      placeholder="Dán API key của bạn vào đây..."
                      className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-orange-400 focus:ring-0 transition-all text-sm"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSaveApiKey}
                  disabled={!tempApiKey.trim()}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white rounded-2xl font-bold shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" /> Lưu cấu hình
                </button>
                
                {!apiKey && (
                  <p className="text-[10px] text-red-500 text-center font-medium">
                    * Bạn phải nhập API key để bắt đầu sử dụng ứng dụng.
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
