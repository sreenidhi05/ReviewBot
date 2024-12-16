import React, { useState } from "react";
import axios from "axios";

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages([...messages, userMessage]);

        try {
            // Send the user message to the Flask backend
            const response = await axios.post("http://localhost:5000/query", {
                question: input,
            });

            // Get the bot's response from the backend
            const botMessage = {
                role: "bot",
                content: response.data.answer || "No response from bot.",
            };

            // Update the chat with the bot's response
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        } catch (error) {
            console.error("Error communicating with the bot:", error);
            const botMessage = {
                role: "bot",
                content: "Sorry, there was an error. Please try again later.",
            };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        } finally {
            setInput("");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-200">
            {/* Chat Container */}
            <div className="bg-white shadow-lg rounded-xl w-full max-w-3xl h-[75%] flex flex-col">
                {/* Header */}
                <div className="bg-gray-800 text-white text-center py-3 font-bold rounded-t-xl">
                    Chatbot
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`max-w-[75%] p-4 rounded-lg ${
                                msg.role === "user"
                                    ? "bg-blue-500 text-white self-end"
                                    : "bg-gray-300 text-black self-start"
                            }`}
                        >
                            {msg.content}
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="bg-white p-4 border-t border-gray-300 flex items-center rounded-b-xl">
                    <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
