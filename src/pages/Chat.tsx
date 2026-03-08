import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockUsers, mockMessages, ChatMessage } from "@/data/mockData";
import { Send, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(mockUsers[0]);
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages([
      ...messages,
      {
        id: String(Date.now()),
        senderId: "me",
        text: newMessage,
        timestamp: new Date(),
      },
    ]);
    setNewMessage("");
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Contacts sidebar */}
        <div
          className={cn(
            "w-80 border-r border-border/50 bg-card/30 flex-shrink-0 flex flex-col",
            "max-md:absolute max-md:inset-y-16 max-md:left-0 max-md:z-40 max-md:w-72",
            !showSidebar && "max-md:hidden"
          )}
        >
          <div className="p-4 border-b border-border/50">
            <h2 className="font-display font-semibold text-sm text-muted-foreground mb-3">Conversations</h2>
            <Input
              placeholder="Search..."
              className="bg-secondary border-border text-sm h-9"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {mockUsers.filter(u => u.online || u.id === "1").map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  setSelectedUser(user);
                  setShowSidebar(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 transition-all duration-150 text-left",
                  selectedUser.id === user.id
                    ? "bg-primary/10 border-r-2 border-primary"
                    : "hover:bg-secondary/50"
                )}
              >
                <div className="relative shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-sm font-display font-bold">
                    {user.name[0]}
                  </div>
                  {user.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-card" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.teaches.slice(0, 2).join(", ")}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="h-14 border-b border-border/50 flex items-center justify-between px-4 bg-card/20">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden text-muted-foreground">
                <ArrowRightLeft className="h-4 w-4" />
              </button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-xs font-display font-bold">
                {selectedUser.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium">{selectedUser.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedUser.online ? "Online" : "Offline"} · {selectedUser.matchPercentage}% match
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "flex",
                  msg.senderId === "me" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.senderId === "me"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-secondary text-secondary-foreground rounded-bl-md"
                  )}
                >
                  <p>{msg.text}</p>
                  <p
                    className={cn(
                      "text-[10px] mt-1",
                      msg.senderId === "me" ? "text-primary-foreground/60" : "text-muted-foreground"
                    )}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/50 bg-card/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="bg-secondary border-border focus:border-primary/50"
              />
              <Button type="submit" size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
