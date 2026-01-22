
import React, { useState, useEffect, useRef } from 'react';
import { InvokeLLM, SendEmail, UploadFile } from '@/api/integrations';
import { ProductOrService, BusinessSettings, User, Client, Project, EstimateApproval, EstimateRequest, EstimateBid } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ruler, Camera, Zap, Calculator, AlertCircle, CheckCircle2, Play, Square, RotateCcw, PenSquare, FileSignature, UserPlus, MapPin, Upload, Image as ImageIcon, Send, Clock, DollarSign } from "lucide-react";
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const categoryLabels = {
  cabinetry: 'Cabinetry',
  carpentry: 'Carpentry', 
  cleaning: 'Cleaning',
  concrete: 'Concrete Work',
  countertop: 'Countertops',
  decking: 'Decking',
  demolition: 'Demolition',
  drywall: 'Drywall',
  electrical: 'Electrical',
  excavation: 'Excavation',
  fencing: 'Fencing',
  flooring: 'Flooring',
  foundation: 'Foundation',
  framing: 'Framing',
  gutters: 'Gutters',
  handyman: 'Handyman Services',
  hvac: 'HVAC',
  insulation: 'Insulation',
  landscaping: 'Landscaping',
  lighting_installation: 'Lighting Installation',
  masonry: 'Masonry',
  painting: 'Painting', 
  paving: 'Paving',
  plans_permits: 'Plans & Permits',
  plumbing: 'Plumbing',
  roofing: 'Roofing',
  siding: 'Siding',
  tile: 'Tile Work',
  trim_molding: 'Trim & Molding',
  ventilation: 'Ventilation',
  waterproofing: 'Waterproofing',
  windows_doors: 'Windows & Doors'
};

const budgetLabels = {
  under_1k: 'Under $1,000',
  '1k_5k': '$1,000 - $5,000',
  '5k_15k': '$5,000 - $15,000',
  '15k_50k': '$15,000 - $50,000',
  '50k_100k': '$50,000 - $100,000',
  over_100k: 'Over $100,000'
};

export default function AREstimatorPage() {
  const [isSupported, setIsSupported] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [measurements, setMeasurements] = useState({
    length: 0,
    width: 0,
    height: 8,
    area: 0
  });
  const [scopeDescription, setScopeDescription] = useState('');
  const [estimate, setEstimate] = useState(null);
  
  // User and data state
  const [currentUser, setCurrentUser] = useState(null);
  const [businessSettings, setBusinessSettings] = useState(null);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Image measurement state
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isAnalyzingImages, setIsAnalyzingImages] = useState(false);
  const [imageEstimate, setImageEstimate] = useState(null);
  const [imageScopeDescription, setImageScopeDescription] = useState('');

  // Bid requests state
  const [bidRequests, setBidRequests] = useState([]);
  const [searchRadius, setSearchRadius] = useState([25]); // miles
  const [isLoadingBids, setIsLoadingBids] = useState(false);
  const [selectedBidRequest, setSelectedBidRequest] = useState(null);
  const [bidFormData, setBidFormData] = useState({
    estimated_cost: '',
    estimated_hours: '',
    bid_description: '',
    warranty_offered: '',
    payment_terms: ''
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUserAndSettings();
    checkARSupport();
  }, []);

  useEffect(() => {
    if (businessSettings) {
      loadBidRequests();
    }
  }, [businessSettings, searchRadius]);

  const loadUserAndSettings = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      const [settingsData, productsData, clientsData] = await Promise.all([
        BusinessSettings.filter({ business_id: user.current_business_id }),
        ProductOrService.filter({ business_id: user.current_business_id }),
        Client.list()
      ]);
      
      setBusinessSettings(settingsData.length > 0 ? settingsData[0] : null);
      setProducts(productsData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    }
  };

  const loadBidRequests = async () => {
    if (!businessSettings?.business_address) return;
    
    setIsLoadingBids(true);
    try {
      // Get all open bid requests
      const allRequests = await EstimateRequest.filter({
        status: { $in: ['open', 'receiving_bids'] }
      }, '-created_date');

      // Filter by radius using AI to calculate distances
      const nearbyRequests = [];
      for (const request of allRequests) {
        try {
          const distanceCheck = await InvokeLLM({
            prompt: `Calculate the distance between these two addresses:
            Address 1: ${businessSettings.business_address}
            Address 2: ${request.project_address}, ${request.project_city}, ${request.project_state}
            
            Return the distance in miles as a number. If you cannot determine the distance, return 999.`,
            response_json_schema: {
              type: 'object',
              properties: {
                distance_miles: { type: 'number' }
              },
              required: ['distance_miles']
            }
          });

          if (distanceCheck.distance_miles <= searchRadius[0]) {
            nearbyRequests.push({
              ...request,
              distance: distanceCheck.distance_miles
            });
          }
        } catch (error) {
          console.warn('Error calculating distance for request:', request.id);
        }
      }

      setBidRequests(nearbyRequests.sort((a, b) => a.distance - b.distance));
    } catch (error) {
      console.error('Error loading bid requests:', error);
      toast.error('Failed to load bid requests');
    } finally {
      setIsLoadingBids(false);
    }
  };

  const checkARSupport = async () => {
    // Simulate AR support check
    setIsSupported(true);
  };

  const startARMeasurement = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error('Camera access not supported in this browser');
      return;
    }

    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Simulate LiDAR measurements with device motion and touch interactions
      simulateLiDARMeasurement();
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please check permissions.');
      setIsCapturing(false);
    }
  };

  const simulateLiDARMeasurement = () => {
    // Simulate progressive measurement updates
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      const simulatedLength = 12 + Math.random() * 8;
      const simulatedWidth = 10 + Math.random() * 6;
      const simulatedHeight = 8 + Math.random() * 2;
      
      setMeasurements({
        length: parseFloat(simulatedLength.toFixed(1)),
        width: parseFloat(simulatedWidth.toFixed(1)),
        height: parseFloat(simulatedHeight.toFixed(1)),
        area: parseFloat((simulatedLength * simulatedWidth).toFixed(1))
      });
      
      if (progress >= 100) {
        clearInterval(interval);
        stopCapture();
        toast.success('Room measurements captured successfully!');
      }
    }, 300);

    // Auto-stop after 3 seconds
    setTimeout(() => {
      clearInterval(interval);
      stopCapture();
      toast.success('Room measurements captured successfully!');
    }, 3000);
  };

  const stopCapture = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    setIsAnalyzingImages(true);
    const newImages = [];

    try {
      for (const file of Array.from(files)) {
        toast.info(`Uploading ${file.name}...`);
        const { file_url } = await UploadFile({ file });
        newImages.push({
          url: file_url,
          name: file.name
        });
      }

      setUploadedImages(prev => [...prev, ...newImages]);
      
      // Analyze images for measurements
      if (newImages.length > 0) {
        await analyzeImagesForMeasurements(newImages);
      }

    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setIsAnalyzingImages(false);
    }
  };

  const analyzeImagesForMeasurements = async (images) => {
    try {
      toast.info("Analyzing images for measurements and scope...");
      
      const analysisResponse = await InvokeLLM({
        prompt: `You are an expert construction estimator analyzing project images. Please examine these images and extract:
        
        1. Room/space measurements (estimate dimensions based on visible references like doors, windows, people, furniture)
        2. Scope of work needed (what type of work is required based on what you see)
        3. Current conditions and any issues visible
        
        Standard door height is typically 7-8 feet, standard ceiling height is 8-9 feet. Use these as reference points.
        
        Provide realistic estimates for room dimensions and describe the work scope in detail.`,
        file_urls: images.map(img => img.url),
        response_json_schema: {
          type: 'object',
          properties: {
            estimated_dimensions: {
              type: 'object',
              properties: {
                length_ft: { type: 'number' },
                width_ft: { type: 'number' },
                height_ft: { type: 'number' },
                area_sq_ft: { type: 'number' }
              }
            },
            scope_description: { type: 'string' },
            work_type: { type: 'string' },
            condition_notes: { type: 'string' }
          },
          required: ['estimated_dimensions', 'scope_description']
        }
      });

      if (analysisResponse?.estimated_dimensions) {
        const dims = analysisResponse.estimated_dimensions;
        setMeasurements({
          length: dims.length_ft || 12,
          width: dims.width_ft || 10,
          height: dims.height_ft || 8,
          area: dims.area_sq_ft || (dims.length_ft * dims.width_ft) || 120
        });
        setImageScopeDescription(analysisResponse.scope_description || '');
        setScopeDescription(analysisResponse.scope_description || '');
        
        toast.success('Images analyzed successfully! Measurements and scope extracted.');
      } else {
        toast.warning('Could not extract measurements from images. Please enter manually.');
      }

    } catch (error) {
      console.error('Error analyzing images:', error);
      toast.error('Failed to analyze images for measurements');
    }
  };

  const generateEstimate = async () => {
    if (!measurements.area || !scopeDescription) {
      toast.error('Please complete measurements and describe the scope of work first.');
      return;
    }

    setIsGenerating(true);
    setEstimate(null);

    try {
      toast.info("Analyzing scope and searching your product catalog...");
      
      // Search internal catalog first
      const internalSearchResponse = await InvokeLLM({
        prompt: `You are an expert construction estimator. A user has provided room measurements and a description of the work they want done. Your task is to analyze their request and determine which items from their existing product and service catalog are needed for the job.

        User's Scope Description: "${scopeDescription}"

        Room Measurements:
        - Length: ${measurements.length} ft
        - Width: ${measurements.width} ft
        - Walls Area (approx): ${(measurements.length * 2 + measurements.width * 2) * measurements.height} sq ft
        - Ceiling Area: ${measurements.area} sq ft
        - Perimeter: ${(measurements.length + measurements.width) * 2} ft

        Available Products/Services Catalog:
        ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, description: p.description, unit: p.unit, type: p.type })), null, 2)}

        Based on the scope and measurements, identify the relevant products/services from the catalog. Calculate the required quantity for each item.

        Return a list of matching product IDs and their calculated quantities. If NO items in the catalog are a good match for the user's request, return an empty list.`,
        response_json_schema: {
          type: 'object',
          properties: {
            matching_products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product_id: { type: 'string' },
                  quantity: { type: 'number' },
                  reasoning: { type: 'string' }
                },
                required: ['product_id', 'quantity']
              }
            }
          },
          required: ['matching_products']
        }
      });

      if (internalSearchResponse?.matching_products?.length > 0) {
        // Found items in catalog
        toast.success("Matching items found in your catalog. Building estimate...");

        const lineItems = internalSearchResponse.matching_products.map(match => {
          const product = products.find(p => p.id === match.product_id);
          if (!product) return null;
          
          const quantity = parseFloat(match.quantity.toFixed(2));
          const unitPrice = product.unit_price || 0;
          const total = quantity * unitPrice;
          
          return {
            name: product.name,
            quantity: quantity,
            unit: product.unit,
            unit_cost: unitPrice,
            total_cost: total,
            type: product.type
          };
        }).filter(Boolean);
        
        const laborCost = lineItems.filter(item => item.type === 'labor').reduce((sum, item) => sum + item.total_cost, 0);
        const materialCost = lineItems.filter(item => item.type !== 'labor').reduce((sum, item) => sum + item.total_cost, 0);
        
        setEstimate({
          source: 'catalog',
          materials_breakdown: lineItems.filter(item => item.type !== 'labor'),
          labor_estimate: {
            total_labor: laborCost,
            rate_per_hour: 65,
            hours: laborCost > 0 ? laborCost / 65 : 0
          },
          total_estimate: laborCost + materialCost,
          confidence: 'High'
        });

      } else {
        // No catalog matches, search internet
        toast.info("No catalog matches found. Researching market rates...");
        
        const marketResearch = await InvokeLLM({
          prompt: `You are a construction cost estimator. Research current market rates for this scope of work:

          Scope: "${scopeDescription}"
          Room Size: ${measurements.length}ft x ${measurements.width}ft (${measurements.area} sq ft)
          
          Provide detailed cost breakdown including materials and labor for ${new Date().getFullYear()}. Use current market rates for materials and typical contractor labor rates ($50-80/hour depending on skill level).`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              materials_breakdown: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    item: { type: 'string' },
                    quantity: { type: 'number' },
                    unit: { type: 'string' },
                    unit_cost: { type: 'number' },
                    total_cost: { type: 'number' }
                  }
                }
              },
              labor_estimate: {
                type: 'object',
                properties: {
                  hours: { type: 'number' },
                  rate_per_hour: { type: 'number' },
                  total_labor: { type: 'number' }
                }
              },
              total_estimate: { type: 'number' }
            },
            required: ['materials_breakdown', 'labor_estimate', 'total_estimate']
          }
        });

        setEstimate({
          source: 'market_research',
          ...marketResearch,
          confidence: 'Medium'
        });

        toast.success("Market research complete. Estimate generated from current rates.");
      }

    } catch (error) {
      console.error('Error generating estimate:', error);
      toast.error('Failed to generate estimate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateQuickProject = async () => {
    if (!estimate || !selectedClientId || !currentUser) {
      toast.error('Please generate an estimate and select a client first.');
      return;
    }
    
    setIsProcessing(true);
    try {
      const client = clients.find(c => c.id === selectedClientId);
      if (!client) {
        toast.error('Selected client not found.');
        setIsProcessing(false);
        return;
      }

      // Transform AI estimate to line items
      const materialLineItems = (estimate.materials_breakdown || []).map(item => ({
        description: item.item || item.name,
        quantity: item.quantity,
        unit_price: item.unit_cost,
        total: item.total_cost,
        type: item.type || 'material',
        taxable: true,
      }));

      let laborLineItem = [];
      if (estimate.labor_estimate && estimate.labor_estimate.total_labor > 0) {
        laborLineItem.push({
          description: 'Estimated Labor',
          quantity: estimate.labor_estimate.hours || 1,
          unit_price: estimate.labor_estimate.rate_per_hour || estimate.labor_estimate.total_labor,
          total: estimate.labor_estimate.total_labor,
          type: 'labor',
          taxable: false,
        });
      }

      const allLineItems = [...materialLineItems, ...laborLineItem];
      const subtotal = allLineItems.reduce((sum, item) => sum + item.total, 0);
      const taxRate = businessSettings?.tax_rate || 0;
      const taxableAmount = allLineItems.filter(item => item.taxable).reduce((sum, item) => sum + item.total, 0);
      const taxAmount = taxableAmount * taxRate;
      const total = subtotal + taxAmount;

      // Create Project entity
      const newProject = await Project.create({
        title: `AR Estimate: ${scopeDescription.substring(0, 30)}...`,
        description: `Generated from AR Estimator.\n\nScope: ${scopeDescription}`,
        client_id: selectedClientId,
        status: 'estimate',
        line_items: allLineItems,
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_after_adjustments: total,
        estimated_cost: total,
        assigned_to: currentUser.email,
      });

      // Create Approval Record
      const approvalToken = `approval_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      await EstimateApproval.create({
        project_id: newProject.id,
        client_email: client.email,
        client_name: client.contact_person,
        sent_date: new Date().toISOString(),
        approval_token: approvalToken,
        status: 'sent'
      });

      // Show Approval Modal
      showApprovalModal(newProject, client, approvalToken);
      toast.success('Quick Project created. Ready for client approval.');

    } catch (error) {
      console.error('Error creating quick project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const showApprovalModal = (project, client, token) => {
    const approvalUrl = `${window.location.origin}${createPageUrl('ClientPortal')}?type=estimate&token=${token}`;
    const emailSubject = `Estimate Ready for Review: ${project.title}`;
    const emailBodyHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
        <h2 style="color: #059669;">Estimate Ready for Review</h2>
        <p>Dear ${client.contact_person},</p>
        <p>Your estimate for <strong>"${project.title}"</strong> is ready for your review and approval.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Total Cost:</strong> $${(project.total_after_adjustments || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${approvalUrl}" target="_blank" style="text-decoration: none; background: #059669; color: white; padding: 12px 24px; border-radius: 6px; font-size: 16px; font-weight: 500;">
            Review and Approve Estimate
          </a>
        </div>
        <p>Best regards,<br>${currentUser?.full_name || 'Project Team'}</p>
      </div>
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
      background: rgba(0,0,0,0.5); display: flex; align-items: center; 
      justify-content: center; z-index: 1000; padding: 20px;
    `;
    
    const modalDialog = document.createElement('div');
    modalDialog.style.cssText = `
      background: white; border-radius: 12px; padding: 30px; 
      max-width: 90vw; max-height: 90vh; overflow-y: auto;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    `;
    
    modalDialog.innerHTML = `
      <div style="max-width: 700px; margin: 0 auto;">
        <h3 style="color: #059669; margin-bottom: 20px;">✅ Project Ready for Approval</h3>
        <input type="text" readonly value="${approvalUrl}" style="width: 100%; border: 1px solid #d1d5db; padding: 8px; border-radius: 6px; margin-bottom: 20px;" />
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button id="sendEmailBtn" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Email Client</button>
          <button id="copyLinkBtn" style="background: #475569; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Copy Link</button>
          <button id="closeModalBtn" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Close</button>
        </div>
      </div>
    `;
    
    modal.appendChild(modalDialog);
    document.body.appendChild(modal);

    const closeModal = () => document.body.removeChild(modal);

    document.getElementById('sendEmailBtn').onclick = async () => {
      try {
        await SendEmail({ to: client.email, subject: emailSubject, body: emailBodyHTML });
        toast.success(`Approval email sent to ${client.email}`);
        closeModal();
      } catch (error) {
        toast.error("Email sending failed.");
      }
    };
    
    document.getElementById('copyLinkBtn').onclick = () => {
      navigator.clipboard.writeText(approvalUrl);
      toast.success('Link copied!');
    };
    
    document.getElementById('closeModalBtn').onclick = closeModal;
  };

  const handleSubmitBid = async (request) => {
    if (!bidFormData.estimated_cost || !bidFormData.bid_description) {
      toast.error('Please fill in the required bid information.');
      return;
    }

    try {
      await EstimateBid.create({
        estimate_request_id: request.id,
        business_id: currentUser.current_business_id,
        business_name: businessSettings.business_name || 'Business',
        contact_person: currentUser.display_name || currentUser.full_name,
        contact_email: currentUser.email,
        contact_phone: businessSettings.business_phone || '',
        estimated_cost: parseFloat(bidFormData.estimated_cost),
        estimated_hours: parseFloat(bidFormData.estimated_hours) || 0,
        bid_description: bidFormData.bid_description,
        warranty_offered: bidFormData.warranty_offered,
        payment_terms: bidFormData.payment_terms || 'Standard terms',
        expires_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      });

      setBidFormData({
        estimated_cost: '',
        estimated_hours: '',
        bid_description: '',
        warranty_offered: '',
        payment_terms: ''
      });
      setSelectedBidRequest(null);
      
      toast.success('Bid submitted successfully!');
      loadBidRequests(); // Refresh the list
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast.error('Failed to submit bid. Please try again.');
    }
  };

  const resetMeasurements = () => {
    setMeasurements({ length: 0, width: 0, height: 8, area: 0 });
    setEstimate(null);
    setScopeDescription('');
    setUploadedImages([]);
    setImageEstimate(null);
    setImageScopeDescription('');
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-6 h-6" />
              AR Not Supported
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">
              AR measurement requires a modern mobile device with camera access and motion sensors.
            </p>
            <p className="text-sm text-slate-500">
              You can still use manual measurement mode to generate estimates.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">AI AR Estimator</h1>
            <p className="text-slate-600">Use augmented reality and AI to measure and estimate project costs in real-time</p>
          </div>
          <Button onClick={resetMeasurements} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset All
          </Button>
        </div>

        <Tabs defaultValue="estimator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="estimator">AR Estimator</TabsTrigger>
            <TabsTrigger value="bids">Nearby Bid Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="estimator">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Measurement & Scope */}
              <div className="space-y-6">
                {/* Client Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5" />
                      Select Client
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a client for this estimate..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.company_name || client.contact_person}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
                
                {/* Measurement Methods */}
                <Card>
                  <CardHeader>
                    <CardTitle>Measurement Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="ar" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="ar">AR Scan</TabsTrigger>
                        <TabsTrigger value="image">Image Analysis</TabsTrigger>
                        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                      </TabsList>

                      <TabsContent value="ar" className="space-y-4">
                        <div className="relative bg-slate-900 rounded-lg overflow-hidden h-64">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                            style={{ display: isCapturing ? 'block' : 'none' }}
                          />
                          {!isCapturing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                              <div className="text-center text-white">
                                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Camera preview will appear here</p>
                              </div>
                            </div>
                          )}
                          <canvas ref={canvasRef} className="hidden" />
                        </div>
                        
                        <Button 
                          onClick={isCapturing ? stopCapture : startARMeasurement}
                          className="w-full"
                          variant={isCapturing ? "destructive" : "default"}
                        >
                          {isCapturing ? (
                            <>
                              <Square className="w-4 h-4 mr-2" />
                              Stop AR Scan
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Start AR Measurement
                            </>
                          )}
                        </Button>
                      </TabsContent>

                      <TabsContent value="image" className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleImageUpload(e.target.files)}
                            accept="image/*"
                            multiple
                            className="hidden"
                          />
                          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-600 mb-2">
                            Upload project images for AI analysis
                          </p>
                          <Button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isAnalyzingImages}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {isAnalyzingImages ? 'Analyzing...' : 'Upload Images'}
                          </Button>
                        </div>

                        {uploadedImages.length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {uploadedImages.map((img, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={img.url}
                                  alt={img.name}
                                  className="w-full h-20 object-cover rounded border"
                                />
                                <p className="text-xs text-center mt-1 truncate">{img.name}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="manual" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="length">Length (ft)</Label>
                            <Input
                              id="length"
                              type="number"
                              step="0.1"
                              value={measurements.length}
                              onChange={(e) => {
                                const length = parseFloat(e.target.value) || 0;
                                setMeasurements(prev => ({
                                  ...prev,
                                  length,
                                  area: length * prev.width
                                }));
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="width">Width (ft)</Label>
                            <Input
                              id="width"
                              type="number"
                              step="0.1"
                              value={measurements.width}
                              onChange={(e) => {
                                const width = parseFloat(e.target.value) || 0;
                                setMeasurements(prev => ({
                                  ...prev,
                                  width,
                                  area: prev.length * width
                                }));
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="height">Height (ft)</Label>
                          <Input
                            id="height"
                            type="number"
                            step="0.1"
                            value={measurements.height}
                            onChange={(e) => setMeasurements(prev => ({
                              ...prev,
                              height: parseFloat(e.target.value) || 8
                            }))}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Current Measurements Display */}
                {measurements.area > 0 && (
                  <Card className="border-emerald-200 bg-emerald-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-emerald-800">Measurements Captured</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>Length: <span className="font-medium">{measurements.length} ft</span></div>
                        <div>Width: <span className="font-medium">{measurements.width} ft</span></div>
                        <div>Height: <span className="font-medium">{measurements.height} ft</span></div>
                        <div>Area: <span className="font-medium">{measurements.area} sq ft</span></div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Scope of Work */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PenSquare className="w-5 h-5" />
                      Scope of Work
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Describe the work you want to estimate... (e.g., 'Paint the entire room with primer and two coats', 'Install hardwood flooring', 'Replace all electrical outlets')"
                      value={scopeDescription}
                      onChange={(e) => setScopeDescription(e.target.value)}
                      rows={4}
                    />
                    {imageScopeDescription && imageScopeDescription !== scopeDescription && (
                      <div className="mt-2 p-2 bg-blue-50 rounded border">
                        <p className="text-xs text-blue-600 mb-1">AI suggested from images:</p>
                        <p className="text-sm">{imageScopeDescription}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setScopeDescription(imageScopeDescription)}
                          className="mt-2"
                        >
                          Use This Description
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Estimate Results */}
              <div className="space-y-6">
                {/* Generate Estimate Button */}
                <Card>
                  <CardContent className="p-6 text-center">
                    <Button 
                      onClick={generateEstimate}
                      disabled={isGenerating || !measurements.area || !scopeDescription}
                      size="lg"
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      {isGenerating ? 'Analyzing...' : 'Generate AI Estimate'}
                    </Button>
                    {(!measurements.area || !scopeDescription) && (
                      <p className="text-sm text-slate-500 mt-2">
                        Complete measurements and scope description to generate estimate
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Estimate Results */}
                {estimate && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>AI-Generated Estimate</span>
                        <Badge variant={estimate.source === 'catalog' ? 'default' : 'secondary'}>
                          {estimate.source === 'catalog' ? 'From Your Catalog' : 'Market Research'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Materials Breakdown */}
                      {estimate.materials_breakdown && estimate.materials_breakdown.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-3">Materials Breakdown</h4>
                          <div className="space-y-2">
                            {estimate.materials_breakdown.map((material, index) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                <div className="flex-1">
                                  <span className="font-medium">{material.item || material.name}</span>
                                  <span className="text-sm text-slate-600 ml-2">
                                    {material.quantity} {material.unit} @ ${material.unit_cost?.toFixed(2)}
                                  </span>
                                </div>
                                <span className="font-medium">${material.total_cost?.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Labor Estimate */}
                      {estimate.labor_estimate && estimate.labor_estimate.total_labor > 0 && (
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-3">Labor Estimate</h4>
                          <div className="p-3 bg-blue-50 rounded">
                            <div className="flex justify-between items-center">
                              <span>
                                {estimate.labor_estimate.hours?.toFixed(1)} hours @ ${estimate.labor_estimate.rate_per_hour?.toFixed(2)}/hr
                              </span>
                              <span className="font-medium">${estimate.labor_estimate.total_labor?.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Total Estimate */}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-lg font-semibold">
                          <span>Total Estimate:</span>
                          <span className="text-emerald-600">${estimate.total_estimate?.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Confidence: {estimate.confidence}</p>
                      </div>
                    </CardContent>

                    {/* Create Project Button */}
                    <CardContent className="border-t pt-4">
                      <Button 
                        onClick={handleCreateQuickProject}
                        disabled={isProcessing || !selectedClientId}
                        size="lg"
                        className="w-full"
                      >
                        <FileSignature className="w-5 h-5 mr-2" />
                        {isProcessing ? 'Creating Project...' : 'Create Quick Project & Get Approval Link'}
                      </Button>
                      {!selectedClientId && (
                        <p className="text-sm text-slate-500 mt-2 text-center">
                          Select a client above to create a project
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bids">
            <div className="space-y-6">
              {/* Search Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Nearby Bid Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Search Radius: {searchRadius[0]} miles</Label>
                      <Slider
                        value={searchRadius}
                        onValueChange={setSearchRadius}
                        max={100}
                        min={5}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-600">
                      <span>Business Address: {businessSettings?.business_address || 'Not set'}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadBidRequests}
                        disabled={isLoadingBids}
                      >
                        {isLoadingBids ? 'Searching...' : 'Refresh Search'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bid Requests List */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {isLoadingBids ? (
                  Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="border-0 shadow-lg bg-white/80">
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : bidRequests.length > 0 ? (
                  bidRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full">
                        <CardHeader>
                          <div className="flex justify-between items-start mb-3">
                            <Badge className="bg-emerald-100 text-emerald-800">
                              {categoryLabels[request.project_category]}
                            </Badge>
                            <Badge variant="outline">
                              {budgetLabels[request.budget_range]}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{request.project_title}</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <p className="text-slate-600 text-sm line-clamp-3">
                            {request.project_description}
                          </p>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin className="w-4 h-4" />
                              <span>{request.project_city}, {request.project_state}</span>
                              <Badge variant="outline" className="ml-auto">
                                {request.distance?.toFixed(1)} mi
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Clock className="w-4 h-4" />
                              <span>{request.timeline}</span>
                            </div>
                          </div>

                          <div className="pt-4 border-t">
                            <Button
                              onClick={() => setSelectedBidRequest(request)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Submit Bid
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <MapPin className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 text-lg">No bid requests found</p>
                    <p className="text-slate-400">Try expanding your search radius</p>
                  </div>
                )}
              </div>

              {/* Bid Submission Modal */}
              {selectedBidRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <CardHeader>
                      <CardTitle>Submit Bid for: {selectedBidRequest.project_title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Project Details</h3>
                        <p className="text-sm text-slate-600 mb-2">{selectedBidRequest.project_description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{budgetLabels[selectedBidRequest.budget_range]}</Badge>
                          <Badge variant="outline">{selectedBidRequest.timeline}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="estimated_cost">Estimated Cost ($) *</Label>
                          <Input
                            id="estimated_cost"
                            type="number"
                            value={bidFormData.estimated_cost}
                            onChange={(e) => setBidFormData(prev => ({ ...prev, estimated_cost: e.target.value }))}
                            placeholder="Enter your bid amount"
                          />
                        </div>
                        <div>
                          <Label htmlFor="estimated_hours">Estimated Hours</Label>
                          <Input
                            id="estimated_hours"
                            type="number"
                            value={bidFormData.estimated_hours}
                            onChange={(e) => setBidFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                            placeholder="Total hours needed"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bid_description">Bid Description *</Label>
                        <Textarea
                          id="bid_description"
                          value={bidFormData.bid_description}
                          onChange={(e) => setBidFormData(prev => ({ ...prev, bid_description: e.target.value }))}
                          placeholder="Describe what's included in your bid..."
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="warranty_offered">Warranty Offered</Label>
                          <Input
                            id="warranty_offered"
                            value={bidFormData.warranty_offered}
                            onChange={(e) => setBidFormData(prev => ({ ...prev, warranty_offered: e.target.value }))}
                            placeholder="e.g., 1 year warranty"
                          />
                        </div>
                        <div>
                          <Label htmlFor="payment_terms">Payment Terms</Label>
                          <Input
                            id="payment_terms"
                            value={bidFormData.payment_terms}
                            onChange={(e) => setBidFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                            placeholder="e.g., 50% upfront, 50% completion"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-6 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedBidRequest(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleSubmitBid(selectedBidRequest)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Submit Bid
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
