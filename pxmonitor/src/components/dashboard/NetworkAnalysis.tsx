
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateDetailedAnalysis } from "@/services/gemini_file"; // Updated import
import DetailedNetworkAnalysis from "./DetailedNetworkAnalysis"; // Import the new component

interface NetworkAnalysisProps {
  metrics: {
    latency: number;
    jitter: number;
    packetLoss: number;
    bandwidth: number;
    dnsDelay: number;
    healthScore: number;
    stability: "stable" | "unstable" | "critical";
    congestion: "stable" | "unstable" | "critical";
    protocolData: { name: string; value: number }[];
  };
}

const NetworkAnalysis = ({ metrics }: NetworkAnalysisProps) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setLoading(true);
    setSheetOpen(true); // Open the sheet immediately to show loading state
    try {
      // Call the new Gemini service for detailed analysis
      const result = await generateDetailedAnalysis(metrics);
      setAnalysis(result);
    } catch (error: any) {
      console.error("Detailed analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Unable to generate detailed network analysis.",
      });
      setSheetOpen(false); // Close sheet on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="bg-card/95 backdrop-blur-sm border-indigo-900/40 shadow-lg shadow-indigo-500/10">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div className="flex flex-col space-y-1.5">
            <CardTitle className="font-montserrat">Comprehensive Network Analysis</CardTitle>
            <CardDescription>
              Get a detailed AI-powered report on your network's health
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Button 
            onClick={handleAnalyze} 
            disabled={loading}
            className="px-8 py-3 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            {loading ? (
              <>
                <span className="mr-3 h-5 w-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
                Generating Report...
              </>
            ) : "Generate Detailed Report"}
          </Button>
        </CardContent>
      </Card>

      {/* Use the new DetailedNetworkAnalysis component for the popup */}
      <DetailedNetworkAnalysis
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        analysis={analysis}
        isLoading={loading}
      />
    </>
  );
};

export default NetworkAnalysis;
