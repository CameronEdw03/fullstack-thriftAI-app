import React, { useState } from "react";
import { GoHomeFill } from "react-icons/go";
import { FaHistory } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { IoIosSend } from "react-icons/io";
import ChatBubble from "./ChatBubble";
import { ImDisplay } from "react-icons/im";
import ToggleSwitch from "./ToggleSwitch";

function Landing() {
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
 
  const handlePredict = async () => {
    if (!brand || !category || !condition || !retailPrice) return;

    const userMsg = `Brand: ${brand}, Category: ${category}, Condition: ${condition}, Retail: $${retailPrice}`;
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          category,
          condition,
          retail_price: Number(retailPrice),
        }),
      });

      const data = await response.json();

      setTimeout(() => {
        setIsTyping(false);
        if (response.ok) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "ai",
              text: `💡 Hi! Your ${brand} ${category} is estimated to resell for $${data.predicted_resale_price}.`,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { sender: "ai", text: `⚠️ Prediction failed: ${data.error || "Try again."}` },
          ]);
        }
      }, 2000);
    } catch (error) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "⚠️ Server error. Check your backend." },
      ]);
    }

    setBrand("");
    setCategory("");
    setCondition("");
    setRetailPrice("");
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/history");
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleMyPredictions = () => {
    setShowHistory((prev) => !prev);
    if (!showHistory) fetchHistory();
    settingsTab(false)
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");

      setMessages((prev) => [
        ...prev,
        { sender: "user", text: `Uploaded image for analysis: ${file.name}` },
        {
          sender: "ai",
          text: `Detected labels: ${data.labels
            .map((label) => `${label.description} (${(label.score * 100).toFixed(1)}%)`)
            .join(", ")}`,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: `⚠️ Image analysis failed: ${err.message}` },
      ]);
    }
  };


  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-80 bg-white text-black p-4">
          <h2 className="text-xl font-bold mb-6">ThriftAI</h2>
          <ul>
            <li
              className="mb-4 hover:text-orange-500 p-2 cursor-pointer flex items-center text-[18px] mt-20"
              onClick={handleMyPredictions}
            >
              <span className="mr-2">
                <FaHistory size={20} />
              </span>
              My predictions
            </li>
          </ul>
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col bg-gray-100 relative">
          {/* Floating History Modal */}
          {showHistory && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative bg-white text-black rounded-lg shadow-lg p-6 w-1/2 h-1/2 overflow-y-auto">
                <button
                  onClick={() => setShowHistory(false)}
                  className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded hover:bg-black transition-all duration-300 cursor-pointer"
                >
                  ✕
                </button>

                <h1 className="text-2xl font-bold mb-4 text-center">
                  Prediction History
                </h1>
                {history.length === 0 ? (
                  <p className="text-center text-gray-600">No history yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {history.map((item, i) => (
                      <li
                        key={i}
                        className="bg-gray-200 p-2 rounded flex items-center justify-between"
                      >
                        <span>
                          {item.brand} {item.category} ({item.condition})
                        </span>
                        <span className="text-orange-500 font-semibold">
                          ${item.predicted_price}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
         

          {/* Chat UI */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            {messages.length === 0 && (
              <div className="mb-6 text-center">
                <h1 className="mt-70 text-[60px] font-bold text-gray-800">
                  Welcome to ThriftAI
                </h1>
                <p className="text-gray-600">
                  Enter your clothing details below and I’ll estimate the resale
                  price.
                </p>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((msg, i) => (
                <ChatBubble key={i} text={msg.text} sender={msg.sender} />
              ))}
              {isTyping && <ChatBubble isTyping />}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom input bar with image upload icon */}
      <div className="fixed bottom-4 left-85 transform bg-white shadow-lg rounded-full flex items-center space-x-2 px-4 py-2 w-3/4">
        <input
          type="text"
          placeholder="Brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="border rounded-full border-stone-300 px-4 py-2 flex-1"
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded-full px-4 py-2 flex-1 border-stone-300"
        />
        <input
          type="text"
          placeholder="Condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          className="border rounded-full px-4 py-2 flex-1 border-stone-300"
        />
        <input
          type="number"
          placeholder="Retail Price"
          value={retailPrice}
          onChange={(e) => setRetailPrice(e.target.value)}
          className="border rounded-full px-4 py-2 flex-1 border-stone-300"
          onKeyDown={(e) => e.key === "Enter" && handlePredict()}
        />

        {/* Image upload button */}
        <label className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-full cursor-pointer flex items-center justify-center">
          📷
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </label>

        <button
          onClick={handlePredict}
          className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-black transition-all duration-300 cursor-pointer"
        >
          <IoIosSend size={25} />
        </button>
      </div>
    </div>
  );
}

export default Landing;
