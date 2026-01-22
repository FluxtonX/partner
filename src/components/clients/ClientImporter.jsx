
import React, { useState, useRef } from 'react';
import { Client } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Field mapping for automatic matching
const FIELD_MAPPINGS = {
  client_type: ['client_type', 'type', 'customer_type'],
  company_name: ['company_name', 'company', 'business_name', 'organization'],
  first_name: ['first_name', 'fname', 'given_name'],
  last_name: ['last_name', 'lname', 'surname', 'family_name'],
  contact_person: ['contact_person', 'contact', 'contact_name', 'representative'],
  email: ['email', 'email_address', 'e_mail'],
  phone: ['phone', 'phone_number', 'telephone', 'mobile'],
  phone_secondary: ['phone_secondary', 'secondary_phone', 'phone2', 'alternate_phone'],
  address: ['address', 'street_address', 'street', 'location'],
  city: ['city', 'town', 'municipality'],
  state: ['state', 'province', 'region'],
  zip_code: ['zip_code', 'zip', 'postal_code', 'postcode'],
  industry: ['industry', 'sector', 'business_type'],
  referral_source: ['referral_source', 'source', 'how_found', 'lead_source'],
  preferred_communication: ['preferred_communication', 'communication_method', 'contact_method'],
  status: ['status', 'client_status', 'lead_status'],
  notes: ['notes', 'comments', 'remarks', 'description'],
};

// CSV parsing function
const parseCSV = (text) => {
  const lines = text.split('\n');
  const result = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const row = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    row.push(current.trim());
    result.push(row);
  }
  
  return result;
};

// Auto-match fields
const autoMapFields = (headers) => {
  const mapping = {};
  const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/[_\s-]/g, ''));
  
  Object.keys(FIELD_MAPPINGS).forEach(targetField => {
    const possibleMatches = FIELD_MAPPINGS[targetField];
    
    for (const match of possibleMatches) {
      const normalizedMatch = match.toLowerCase().replace(/[_\s-]/g, '');
      const headerIndex = normalizedHeaders.findIndex(h => h.includes(normalizedMatch));
      
      if (headerIndex !== -1) {
        mapping[targetField] = headers[headerIndex];
        break;
      }
    }
  });
  
  return mapping;
};

export default function ClientImporter({ onClose, onImportSuccess }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [previewRows, setPreviewRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [autoMapping, setAutoMapping] = useState({});
  const [unmappedFields, setUnmappedFields] = useState([]);
  const [manualValues, setManualValues] = useState({});
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);
  const [url, setUrl] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [mappingConfirmed, setMappingConfirmed] = useState(false);

  const processCSVData = (csvText) => {
    try {
      const data = parseCSV(csvText);
      if (data.length < 1) {
        setError('No data found in the file.');
        return;
      }

      if (data.length === 1) {
        setError('File contains only headers, no data rows found.');
        return;
      }

      setHeaders(data[0]);
      setPreviewRows(data.slice(1, 6));

      const objectData = [];
      for (let i = 1; i < data.length; i++) {
        const rowObj = {};
        for (let j = 0; j < data[0].length; j++) {
          rowObj[data[0][j]] = data[i][j];
        }
        objectData.push(rowObj);
      }
      setAllRows(objectData);

      // Auto-map fields
      const mapping = autoMapFields(data[0]);
      setAutoMapping(mapping);

      // Find unmapped required fields
      const requiredFields = ['email', 'phone'];
      const unmapped = requiredFields.filter(field => !mapping[field]);
      setUnmappedFields(unmapped);
      setMappingConfirmed(false); // Reset mapping confirmation for new file
      setManualValues({}); // Reset manual values for new file

      setStep(2);
    } catch (err) {
      setError('Failed to parse the CSV file. Please ensure it is properly formatted.');
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setError(null);
    setFile(selectedFile);
    setUrl('');

    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith('.csv')) {
      setError('Please upload a .csv file. Excel files are not supported - please save as CSV first.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      processCSVData(event.target.result);
    };
    reader.readAsText(selectedFile);
  };

  const handleFetchFromUrl = async () => {
    if (!url) {
      setError('Please enter a valid URL.');
      return;
    }

    setIsFetchingUrl(true);
    setError(null);
    setFile(null);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      const csvText = await response.text();
      processCSVData(csvText);
    } catch (err) {
      setError(`Failed to fetch CSV from URL: ${err.message}`);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleSaveMapping = () => {
    setMappingConfirmed(true);
  };

  const handleCancelMapping = () => {
    // Reset all mapping-related state
    setHeaders([]);
    setPreviewRows([]);
    setAllRows([]);
    setAutoMapping({});
    setUnmappedFields([]);
    setManualValues({});
    setMappingConfirmed(false);
    setFile(null);
    setUrl('');
    setError(null);
    setStep(1);
  };

  const handleManualValueChange = (field, value) => {
    setManualValues(prev => ({ ...prev, [field]: value }));
  };

  const handleImport = async () => {
    // Check if all required unmapped fields have manual values
    const missingRequired = unmappedFields.filter(field => 
      ['email', 'phone'].includes(field) && !manualValues[field]
    );

    if (missingRequired.length > 0) {
      setError(`Please provide values for required fields: ${missingRequired.join(', ')}`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    const clientsToCreate = [];

    for (let i = 0; i < allRows.length; i++) {
      const row = allRows[i];
      const newClient = {};

      // Apply auto-mapped fields
      Object.keys(autoMapping).forEach(targetField => {
        const sourceHeader = autoMapping[targetField];
        let value = row[sourceHeader];
        
        if (value !== null && value !== undefined && value.toString().trim() !== '') {
          if (targetField === 'client_type') {
            const validTypes = ['residential', 'commercial'];
            value = validTypes.includes(String(value).toLowerCase()) ? String(value).toLowerCase() : 'residential';
          }
          if (targetField === 'status') {
            const validStatuses = ['lead', 'prospect', 'active', 'inactive', 'do_not_contact'];
            value = validStatuses.includes(String(value).toLowerCase()) ? String(value).toLowerCase() : 'prospect';
          }
          if (targetField === 'preferred_communication') {
            const validComms = ['phone', 'email', 'text', 'any'];
            value = validComms.includes(String(value).toLowerCase()) ? String(value).toLowerCase() : 'any';
          }
          if (targetField === 'industry') {
            const validIndustries = ['construction', 'technology', 'healthcare', 'finance', 'retail', 'manufacturing', 'other'];
            value = validIndustries.includes(String(value).toLowerCase()) ? String(value).toLowerCase() : 'other';
          }
          newClient[targetField] = value;
        }
      });

      // Apply manual values for unmapped fields
      Object.keys(manualValues).forEach(field => {
        if (manualValues[field]) {
          newClient[field] = manualValues[field];
        }
      });

      // Set defaults and auto-populate contact_person
      if (!newClient.contact_person) {
        if (newClient.client_type === 'residential' && newClient.first_name && newClient.last_name) {
          newClient.contact_person = `${newClient.first_name} ${newClient.last_name}`.trim();
        } else if (newClient.company_name) {
          newClient.contact_person = newClient.company_name;
        } else {
          newClient.contact_person = `Client ${i + 1}`;
        }
      }
      
      if (!newClient.email) newClient.email = manualValues.email || `client${i + 1}@example.com`;
      if (!newClient.phone) newClient.phone = manualValues.phone || '(000) 000-0000';
      if (!newClient.client_type) newClient.client_type = 'residential';
      if (!newClient.status) newClient.status = 'prospect';
      
      clientsToCreate.push(newClient);
      setImportProgress(((i + 1) / allRows.length) * 50);
    }

    try {
      const batchSize = 25;
      let created = 0;
      
      for (let i = 0; i < clientsToCreate.length; i += batchSize) {
        const batch = clientsToCreate.slice(i, i + batchSize);
        await Client.bulkCreate(batch);
        created += batch.length;
        setImportProgress(50 + ((created / clientsToCreate.length) * 50));
      }
      
      setImportProgress(100);
      setImportResult({ success: true, count: clientsToCreate.length });
    } catch (err) {
      console.error('Import error:', err);
      setError(`Import failed: ${err.message}`);
      setImportResult({ success: false, error: err.message });
    } finally {
      setIsProcessing(false);
      setStep(3);
    }
  };

  const handleClose = () => {
    if (importResult?.success) {
      onImportSuccess();
    }
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import Clients</DialogTitle>
          <DialogDescription>
            {step === 1 && "Upload a CSV file or provide a URL to import clients."}
            {step === 2 && "Review the automatic field matching and provide values for unmapped fields."}
            {step === 3 && "Import completed - review the results."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <div className="py-8 space-y-6">
            <div className="text-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".csv" 
                className="hidden" 
              />
              <Button onClick={() => fileInputRef.current.click()} size="lg" disabled={isFetchingUrl}>
                <Upload className="mr-2 h-5 w-5" /> Choose CSV File
              </Button>
              <p className="mt-2 text-sm text-slate-500">
                Upload a file from your computer. First row should contain headers.
              </p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-url">Import from URL</Label>
              <div className="flex gap-2">
                <Input
                  id="import-url"
                  placeholder="https://example.com/clients.csv"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isFetchingUrl}
                />
                <Button onClick={handleFetchFromUrl} disabled={isFetchingUrl || !url}>
                  {isFetchingUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && !mappingConfirmed && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Auto-Mapping Results</AlertTitle>
              <AlertDescription>
                Found {Object.keys(autoMapping).length} matching fields. 
                Review the mapping below and confirm to proceed.
              </AlertDescription>
            </Alert>

            {Object.keys(autoMapping).length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Automatically Mapped Fields:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(autoMapping).map(([target, source]) => (
                    <div key={target} className="flex justify-between p-2 bg-green-50 rounded">
                      <span className="font-medium">{target}:</span>
                      <span>{source}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {unmappedFields.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Missing Required Fields</AlertTitle>
                <AlertDescription>
                  The following required fields were not found in your file: {unmappedFields.join(', ')}. 
                  After confirming the mapping, you'll need to provide default values for these fields.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <h4 className="font-semibold mb-2">Data Preview:</h4>
              <div className="overflow-auto border rounded-lg max-h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.slice(0, 5).map(header => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                      {headers.length > 5 && <TableHead>...</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, i) => (
                      <TableRow key={i}>
                        {row.slice(0, 5).map((cell, j) => (
                          <TableCell key={j}>{cell}</TableCell>
                        ))}
                        {row.length > 5 && <TableCell>...</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleCancelMapping}>
                Cancel & Start Over
              </Button>
              <Button onClick={handleSaveMapping} className="bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Mapping
              </Button>
            </div>
          </div>
        )}

        {step === 2 && mappingConfirmed && unmappedFields.length > 0 && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Mapping Confirmed</AlertTitle>
              <AlertDescription>
                Please provide default values for the unmapped required fields below.
              </AlertDescription>
            </Alert>

            <div>
              <h4 className="font-semibold mb-2">Manual Input Required:</h4>
              <div className="space-y-3">
                {unmappedFields.map(field => (
                  <div key={field} className="space-y-1">
                    <Label htmlFor={field}>
                      {field.replace('_', ' ').toUpperCase()}
                      {['email', 'phone'].includes(field) && <span className="text-red-500"> *</span>}
                    </Label>
                    {field === 'client_type' ? (
                      <Select onValueChange={(value) => handleManualValueChange(field, value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select default client type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={field}
                        placeholder={`Enter default ${field.replace('_', ' ')}`}
                        value={manualValues[field] || ''}
                        onChange={(e) => handleManualValueChange(field, e.target.value)}
                        required={['email', 'phone'].includes(field)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleCancelMapping}>
                Cancel & Start Over
              </Button>
              <Button onClick={handleImport} disabled={isProcessing}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Import {allRows.length} Clients
              </Button>
            </div>
          </div>
        )}

        {step === 2 && mappingConfirmed && unmappedFields.length === 0 && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Ready to Import</AlertTitle>
              <AlertDescription>
                All required fields have been mapped. Your data is ready for import.
              </AlertDescription>
            </Alert>

            <div>
              <h4 className="font-semibold mb-2">Import Summary:</h4>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p><strong>Records to import:</strong> {allRows.length}</p>
                <p><strong>Mapped fields:</strong> {Object.keys(autoMapping).length}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleCancelMapping}>
                Cancel & Start Over
              </Button>
              <Button onClick={handleImport} disabled={isProcessing}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Import {allRows.length} Clients
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-8 text-center">
            {isProcessing ? (
              <>
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-emerald-600 mb-4" />
                <h3 className="text-xl font-semibold">Importing Clients...</h3>
                <p className="text-slate-500">Processing your data.</p>
                <Progress value={importProgress} className="w-full max-w-sm mx-auto mt-4" />
              </>
            ) : importResult?.success ? (
              <>
                <CheckCircle className="h-12 w-12 mx-auto text-emerald-600 mb-4" />
                <h3 className="text-xl font-semibold">Import Successful!</h3>
                <p className="text-slate-500">{importResult.count} clients imported successfully.</p>
              </>
            ) : (
              <>
                <AlertCircle className="h-12 w-12 mx-auto text-red-600 mb-4" />
                <h3 className="text-xl font-semibold">Import Failed</h3>
                <p className="text-slate-500">{importResult?.error || 'An unknown error occurred.'}</p>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 1 && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}
          {step === 3 && (
            <Button onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
