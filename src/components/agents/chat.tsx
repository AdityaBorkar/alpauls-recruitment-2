import { IconMessageChatbot, IconSend } from "@tabler/icons-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type Message = { content: string; id: string; role: "assistant" | "user" };

function ChatPanelContent() {
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Message[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { content: trimmed, id: crypto.randomUUID(), role: "user" },
    ]);
    setInput("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <IconMessageChatbot className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">Agentic Chat</p>
              <p className="mt-4 text-muted-foreground text-xs">
                Ask questions or give instructions to your AI assistant
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                className={cn(
                  "flex gap-3",
                  message.role === "user" && "flex-row-reverse",
                )}
                key={message.id}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted",
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form className="border-t p-3" onSubmit={handleSubmit}>
        <div className="flex items-end gap-2">
          <Textarea
            className="field-sizing-fixed min-h-9 flex-1 resize-none"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask anything..."
            rows={1}
            value={input}
          />
          <Button
            className="shrink-0"
            disabled={!input.trim()}
            size="icon-sm"
            type="submit"
          >
            <IconSend className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

function ChatPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "e" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (isMobile) {
    return (
      <Sheet onOpenChange={onOpenChange} open={open}>
        <SheetContent className="w-96 rounded-xl p-0" side="right">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="font-semibold text-sm">
              Agentic Chat
            </SheetTitle>
          </SheetHeader>
          <ChatPanelContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "my-2 mr-2 hidden shrink-0 overflow-hidden rounded-xl bg-white transition-[width] duration-200 ease-out md:block dark:bg-black",
        open ? "w-120" : "w-0",
      )}
    >
      <div className="flex size-full flex-col">
        <ChatPanelContent />
      </div>
    </div>
  );
}

export { ChatPanel, ChatPanelContent };
