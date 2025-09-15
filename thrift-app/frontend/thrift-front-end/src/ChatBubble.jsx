import React from "react";

function ChatBubble({ text, sender, isTyping }) {
  if (isTyping) {
    return (
      <div className="bg-white text-black px-4 py-2 rounded-2xl shadow-md inline-block">
        <div className="flex space-x-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`max-w-xs px-4 py-2 rounded-2xl shadow-md ${
        sender === "user"
          ? "bg-orange-500 text-white ml-auto"
          : "bg-white text-black"
      }`}
    >
      {text}
    </div>
  );
}

export default ChatBubble;
