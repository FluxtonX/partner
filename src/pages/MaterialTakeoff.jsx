
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, X, Loader2, FileText } from 'lucide-react';
import { UploadFile, InvokeLLM } from '@/api/integrations';
import { toast } from 'sonner';
import MaterialListTable from '../components/takeoff/MaterialListTable';
import { useLanguage } from '@/components/providers/LanguageContext';

const materialListSchema = {
  type: "object",
  properties: {
    materials: {
      type: "array",
      items: {
        type: "object",
        properties: {
          item_name: {
            type: "string",
            description: "Name of the material or item (e.g., '2x4 Lumber', 'Sheet of Drywall')."
          },
          quantity: {
            type: "number",
            description: "The total quantity of the item needed."
          },
          unit: {
            type: "string",
            description: "The unit of measurement (e.g., 'linear feet', 'sheets', 'each', 'gallons')."
          },
          specifications: {
            type: "string",
            description: "Specific details or dimensions (e.g., '8 ft length', '4x8 ft, 1/2 inch thick', 'Grade #2 SPF')."
          },
          category: {
             type: "string",
             description: "A relevant construction category for the material, like 'framing', 'drywall', 'electrical', 'plumbing', 'roofing', 'foundation', etc."
          },
          page_reference: {
            type: "string",
            description: "The blueprint page number or detail reference where this item was found (e.g., 'A-2', 'Detail 5/S-1'). This is a mandatory field."
          }
        },
        "required": ["item_name", "quantity", "unit", "page_reference"]
      }
    }
  },
  "required": ["materials"]
};

export default function MaterialTakeoffPage() {
  const { t } = useLanguage();
  const [file, setFile] = useState(null);
  const [materialList, setMaterialList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setMaterialList([]);
      setError(null);
    } else {
      toast.error('Invalid file type. Please upload a PDF.');
    }
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleAnalyzeBlueprint = async () => {
    if (!file) {
      toast.error("Please upload a blueprint PDF first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMaterialList([]);
    setProgress(0);

    try {
      // Step 1: Upload the file
      setProgress(10);
      toast.info("Uploading blueprint...");
      const { file_url } = await UploadFile({ file });
      if (!file_url) {
        throw new Error("File upload failed.");
      }

      // Step 2: Use InvokeLLM with the enhanced prompt for maximum specificity
      setProgress(40);
      toast.info("Analyzing blueprint... This may take a few moments.");

      const prompt = `You are an exceptionally precise and reliable senior construction estimator with 20+ years of experience. Your primary responsibility is to perform a comprehensive material takeoff from the provided blueprint PDF with the highest possible accuracy and MAXIMUM SPECIFICITY.

**CRITICAL REQUIREMENT: MAXIMUM SPECIFICITY**
Every material you identify must include complete, detailed specifications that would allow direct procurement without ambiguity. Include:
- Exact dimensions (length, width, thickness, diameter)
- Material grade (e.g., Grade #2 SPF, Grade A, Construction grade)
- Type/classification (e.g., Douglas Fir, Southern Yellow Pine, Type X gypsum, etc.)
- Standards/codes (e.g., ASTM, APA, ICC-ES numbers)
- Specific product designations when shown (e.g., TJI 560, Simpson LU26, etc.)
- Finish specifications (e.g., galvanized, pressure-treated, fire-rated)
- Installation spacing/centers when applicable (e.g., 16" O.C., 24" O.C.)

**Triple-Check and Averaging Methodology:**

**Phase 1: Comprehensive Analysis**
1.  **Full Document Scan**: Analyze every single page, detail, schedule, note, and specification. Create an internal inventory of all sections including:
    - Floor plans, elevations, sections
    - Structural drawings and details
    - Door/window/finish schedules
    - Specification notes and callouts
    - Detail drawings and enlarged views
    - Any material lists or legends

2.  **Initial Takeoff (Check 1)**: Perform complete material takeoff with maximum detail:
    - Extract every component with full specifications
    - Calculate precise quantities including waste factors
    - Note exact locations and applications
    - Record all dimensions and specifications shown

**Phase 2: Independent Verification**
1.  **Second Independent Takeoff (Check 2)**: Without referring to Check 1 results, perform a completely independent takeoff from scratch. Re-examine every drawing and re-calculate all quantities with full specifications.

2.  **Third Independent Takeoff (Check 3)**: Again, without referring to previous results, perform a third complete takeoff, re-calculating all quantities and re-extracting all specifications.

**Phase 3: Reconciliation & Finalization**
1.  **Quantity Averaging**: For each material, compare your three quantity calculations:
    - If within 2% tolerance: calculate the average
    - If significant discrepancy: re-investigate that specific item to determine correct quantity
    - Round final average to appropriate precision for the unit type

2.  **Specification Consolidation**: Ensure all three checks identified the same detailed specifications. If any discrepancies exist, re-examine the blueprints to determine the correct specification.

3.  **Category Assignment**: Assign each material to the most appropriate category from this EXACT list:
    **Valid Categories**: appliances, cabinetry, carpentry, cleaning, concrete, countertop, decking, demolition, drywall, electrical, excavation, fencing, flooring, foundation, framing, gutters, handyman, hvac, insulation, landscaping, lighting_installation, masonry, painting, paving, plans_permits, plumbing, project, repair, roofing, siding, tile, trim_molding, ventilation, waterproofing, windows_doors

**EXAMPLES OF REQUIRED SPECIFICITY:**

❌ VAGUE: "Lumber - 100 pieces"
✅ SPECIFIC: "2x6 Douglas Fir Construction Grade Lumber - 156 pieces, 16 ft length, kiln-dried, for wall framing studs @ 16\" O.C."

❌ VAGUE: "Concrete - 25 yards"
✅ SPECIFIC: "Ready-Mix Concrete - 28.5 cubic yards, 3500 PSI, 6-inch slump, 3/4\" aggregate, for ground floor slab (4\" thick)"

❌ VAGUE: "Plywood - 50 sheets"
✅ SPECIFIC: "APA-Rated Plywood Sheathing - 86 sheets, 1/2\" x 4' x 8', CDX grade, for exterior wall sheathing"

❌ VAGUE: "Drywall - 200 sheets"
✅ SPECIFIC: "Gypsum Wallboard - 434 sheets, 5/8\" Type X fire-rated, 4' x 12', for interior walls and ceilings per code requirements"

**FINAL OUTPUT REQUIREMENTS:**
- Every \`item_name\` must include complete specifications
- Every \`specifications\` field must contain detailed technical information
- Every \`quantity\` must be the verified average from your three calculations
- Every \`unit\` must be precise (e.g., "linear feet" not "feet", "cubic yards" not "yards")
- Every \`page_reference\` must indicate exactly where the information was found
- Every \`category\` must be from the approved list above

Your reputation depends on providing procurement-ready specifications. Be exhaustively detailed.`;

      const result = await InvokeLLM({
        prompt: prompt,
        file_urls: [file_url], // Pass the file URL
        response_json_schema: materialListSchema
      });
      
      setProgress(90);

      // InvokeLLM directly returns the JSON object if schema is provided
      if (result && result.materials) {
        setMaterialList(result.materials);
        toast.success("Detailed material takeoff completed successfully!");
      } else {
        throw new Error("AI analysis failed to produce a valid material list. The response might not be in the expected format.");
      }

    } catch (err) {
      console.error("Analysis failed:", err);
      setError(`An error occurred during analysis: ${err.message}`);
      toast.error("Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };
  
  const clearFile = () => {
    setFile(null);
    setMaterialList([]);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-8 h-8 text-slate-700" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">AI Material Takeoff</h1>
            <p className="text-slate-600">Upload blueprints and let AI generate comprehensive material lists for your projects</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Upload Blueprint</CardTitle>
            <CardDescription>Drag and drop your PDF file or click to select a file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`p-12 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                  isDragOver ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300 hover:border-emerald-400'
                }`}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                {isDragOver ? (
                  <p className="text-emerald-600 font-semibold">Drop the file here...</p>
                ) : (
                  <p className="text-slate-500">Drag 'n' drop a PDF here, or click to select a file</p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                <div className="font-medium text-slate-700">{file.name}</div>
                <Button variant="ghost" size="icon" onClick={clearFile}>
                  <X className="w-4 h-4 text-slate-500"/>
                </Button>
              </div>
            )}

            {isLoading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-slate-600">Analyzing your blueprint...</p>
              </div>
            )}
            
            <div className="flex justify-center">
              <Button 
                onClick={handleAnalyzeBlueprint} 
                disabled={!file || isLoading}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Generate Material List'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {materialList.length > 0 && !isLoading && (
          <MaterialListTable materials={materialList} />
        )}
      </div>
    </div>
  );
}
