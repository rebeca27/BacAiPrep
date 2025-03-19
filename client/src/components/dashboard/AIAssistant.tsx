import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SendIcon, Bot } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface Message {
  content: string;
  isUser: boolean;
}

interface AIAssistantProps {
  initialMessages: Message[];
}

export default function AIAssistant({ initialMessages = [] }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!question.trim()) return;

    const userMessage: Message = {
      content: question,
      isUser: true,
    };

    // Add user's message to the chat
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setQuestion("");
    setIsSubmitting(true);

    try {
      // Send the question to the AI API
      const response = await apiRequest("POST", "/api/ai/chat", {
        userId: 1, // Using the demo user id
        messages: updatedMessages,
      });

      const data = await response.json();

      // Add AI's response to the chat
      setMessages([
        ...updatedMessages,
        { content: data.response, isUser: false },
      ]);

      // Invalidate cache to update chat history
      queryClient.invalidateQueries({ queryKey: ['/api/users/1/chat-history'] });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isSubmitting) {
      handleSendMessage();
    }
  };

  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-neutral-900">AI Learning Assistant</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="bg-neutral-50 rounded-lg p-4 mb-4 max-h-48 overflow-y-auto">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-500" />
                </div>
                <div className="ml-3 bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-sm text-neutral-800">
                    Hello! I'm your AI learning assistant. How can I help with your Bacalaureat preparation today?
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start ${
                    message.isUser ? "justify-end" : ""
                  }`}
                >
                  {!message.isUser && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary-500" />
                    </div>
                  )}
                  <div
                    className={`${
                      message.isUser
                        ? "mr-3 bg-primary-50"
                        : "ml-3 bg-white shadow-sm"
                    } rounded-lg p-3`}
                  >
                    <p className="text-sm text-neutral-800 whitespace-pre-line">
                      {message.content}
                    </p>
                  </div>
                  {message.isUser && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      <span className="text-sm font-medium">A</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question about any subject..."
            className="flex-grow shadow-sm focus:ring-primary-500 focus:border-primary-500"
            disabled={isSubmitting}
          />
          <Button
            onClick={handleSendMessage}
            className="ml-3 inline-flex items-center"
            disabled={isSubmitting || !question.trim()}
          >
            <SendIcon className="mr-2 h-4 w-4" />
            Send
          </Button>
        </div>
        <div className="mt-3 text-xs text-neutral-500 flex items-center">
          <span className="mr-1">ℹ️</span>
          Your AI assistant can explain concepts and provide practice questions
        </div>
      </CardContent>
    </Card>
  );
}
