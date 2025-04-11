import { Button } from '@/components/ui/button';
import { LayoutGrid, Loader2Icon } from 'lucide-react';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { chatSession } from '@/config/GoogleAIModel';

function GenerateAITemplate({ setGenerateAIOutput }) {
  const [open, setOpen] = useState(false);
  const [userInput, setUserInput] = useState();
  const [loading, setLoading] = useState(false);

  const GenerateFromAI = async () => {
    setLoading(true);
    const PROMPT = 'Generate content for a Draft.js editor in raw JSON format for: ' + userInput;
  
    try {
      const result = await chatSession.sendMessage(PROMPT);
      const text = await result.response.text();
  
      console.log("🧠 Raw AI response:", text);
  
      // Handle code block or markdown output
      const cleaned = text
        .replace(/```json|```js|```/g, '') // Remove markdown code fences
        .trim();
  
      const parsed = JSON.parse(cleaned);
  
      if (parsed?.blocks && parsed?.entityMap !== undefined) {
        setGenerateAIOutput(parsed);
      } else {
        console.error("Invalid Draft.js content structure.");
      }
    } catch (error) {
      console.error("Error parsing AI output:", error);
    }
  
    setLoading(false);
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outline" className="flex gap-2" onClick={() => setOpen(true)}>
        <LayoutGrid className="h-4 w-4" /> Generate AI Template
      </Button>

      <Dialog open={open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate AI Template</DialogTitle>
            <DialogDescription>
              <div>
                <h2 className="mt-5">What do you want to write in the document?</h2>
                <Input
                  placeholder="e.g. Resume"
                  onChange={(event) => setUserInput(event?.target.value)}
                />
                <div className="mt-5 flex gap-5 justify-end">
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    disabled={!userInput || loading}
                    onClick={GenerateFromAI}
                  >
                    {loading ? <Loader2Icon className="animate-spin" /> : 'Generate'}
                  </Button>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GenerateAITemplate;