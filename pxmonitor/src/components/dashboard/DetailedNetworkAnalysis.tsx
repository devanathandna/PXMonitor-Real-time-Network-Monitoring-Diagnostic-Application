import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DetailedNetworkAnalysisProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: string;
  isLoading: boolean;
}

const DetailedNetworkAnalysis = ({ isOpen, onClose, analysis, isLoading }: DetailedNetworkAnalysisProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-full flex flex-col bg-card/95 backdrop-blur-sm p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-2xl font-montserrat gradient-text">
            Comprehensive Network Analysis
          </SheetTitle>
          <SheetDescription>
            An AI-powered deep dive into your network's performance metrics.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-grow overflow-auto">
          <ScrollArea className="h-full">
            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full pt-20">
                  <div className="h-8 w-8 rounded-full border-4 border-t-transparent border-indigo-500 animate-spin" />
                  <p className="mt-4 text-lg text-muted-foreground">Generating Detailed Analysis...</p>
                  <p className="text-sm text-muted-foreground/80">Please wait while the AI processes your network data.</p>
                </div>
              ) : (
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-3xl font-bold mb-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-2xl font-semibold mt-8 mb-4 border-b pb-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-xl font-semibold mt-6 mb-3" {...props} />,
                      p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                      li: ({node, ...props}) => <li className="pl-2" {...props} />,
                    }}
                  >
                    {analysis}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DetailedNetworkAnalysis;
