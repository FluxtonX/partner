import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, PenTool, FileText, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function DigitalSignatureDialog({ 
    estimate, 
    client, 
    contract, 
    businessSettings, 
    onApprove, 
    onCancel 
}) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [signatureName, setSignatureName] = useState('');
    const [comments, setComments] = useState('');
    const [hasSignature, setHasSignature] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }, []);

    const startDrawing = (e) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        
        ctx.beginPath();
        ctx.moveTo(
            (e.clientX || e.touches[0].clientX) - rect.left,
            (e.clientY || e.touches[0].clientY) - rect.top
        );
    };

    const draw = (e) => {
        if (!isDrawing) return;
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        
        ctx.lineTo(
            (e.clientX || e.touches[0].clientX) - rect.left,
            (e.clientY || e.touches[0].clientY) - rect.top
        );
        ctx.stroke();
        setHasSignature(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    const handleSubmit = async () => {
        if (!signatureName.trim()) {
            toast.error("Please enter your full name");
            return;
        }

        if (!hasSignature) {
            toast.error("Please provide your digital signature");
            return;
        }

        setIsSubmitting(true);

        try {
            // Convert canvas to base64
            const canvas = canvasRef.current;
            const signatureData = canvas.toDataURL();

            await onApprove({
                signature: signatureData,
                signerName: signatureName,
                comments: comments,
                signedDate: new Date().toISOString(),
                ipAddress: 'internal-approval'
            });

            toast.success("Estimate approved successfully");
        } catch (error) {
            toast.error("Failed to approve estimate");
            console.error("Approval error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const depositAmount = contract?.deposit_percentage 
        ? (estimate.total_after_adjustments || estimate.estimated_cost || 0) * (contract.deposit_percentage / 100)
        : 0;

    return (
        <Dialog open={true} onOpenChange={onCancel}>
            <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FileText className="w-6 h-6" />
                        Digital Signature Required
                    </DialogTitle>
                    <DialogDescription>
                        Please review the estimate details and terms below, then provide your digital signature to approve.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Estimate Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Estimate Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-slate-700">Project</h4>
                                    <p className="text-lg font-semibold">{estimate.title}</p>
                                    {estimate.description && (
                                        <p className="text-sm text-slate-600 mt-1">{estimate.description}</p>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-700">Client</h4>
                                    <p className="font-semibold">{client?.contact_person || client?.email}</p>
                                    {client?.address && (
                                        <p className="text-sm text-slate-600">
                                            {client.address}, {client.city}, {client.state} {client.zip_code}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-emerald-600">
                                        ${(estimate.total_after_adjustments || estimate.estimated_cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-sm text-slate-600 font-medium">Total Cost</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-semibold">
                                        {estimate.estimated_hours || 0} hrs
                                    </p>
                                    <p className="text-sm text-slate-600 font-medium">Estimated Hours</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-semibold">
                                        {estimate.estimated_completion === 'TBD' 
                                            ? 'TBD' 
                                            : estimate.estimated_completion 
                                                ? format(new Date(estimate.estimated_completion), 'MMM d, yyyy')
                                                : 'Not specified'
                                        }
                                    </p>
                                    <p className="text-sm text-slate-600 font-medium">Est. Completion</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Terms and Conditions */}
                    {contract && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    Terms & Conditions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h5 className="font-medium text-slate-700">Payment Terms</h5>
                                        <p className="text-sm">{contract.payment_terms}</p>
                                    </div>
                                    {contract.deposit_percentage > 0 && (
                                        <div>
                                            <h5 className="font-medium text-slate-700">Deposit Required</h5>
                                            <p className="text-sm font-semibold text-emerald-600">
                                                ${depositAmount.toFixed(2)} ({contract.deposit_percentage}% of total)
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {contract.warranty_period_days > 0 && (
                                    <div>
                                        <h5 className="font-medium text-slate-700">Warranty</h5>
                                        <p className="text-sm">{contract.warranty_period_days} days from completion</p>
                                    </div>
                                )}
                                {contract.terms_and_conditions && (
                                    <div>
                                        <h5 className="font-medium text-slate-700">Additional Terms</h5>
                                        <div className="bg-slate-50 p-3 rounded-lg text-sm max-h-32 overflow-y-auto">
                                            {contract.terms_and_conditions}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Signature Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <PenTool className="w-5 h-5" />
                                Digital Signature
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signatureName">Full Name *</Label>
                                    <Input
                                        id="signatureName"
                                        value={signatureName}
                                        onChange={(e) => setSignatureName(e.target.value)}
                                        placeholder="Enter your full legal name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input value={format(new Date(), 'PPP')} readOnly className="bg-slate-50" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Digital Signature *</Label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                                    <canvas
                                        ref={canvasRef}
                                        width={400}
                                        height={150}
                                        className="w-full border rounded bg-white cursor-crosshair"
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-sm text-slate-600">Sign above</p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={clearSignature}
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="comments">Comments (Optional)</Label>
                                <Textarea
                                    id="comments"
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    placeholder="Any additional comments or notes..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Legal Notice */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-amber-800">Legal Agreement</h4>
                                <p className="text-sm text-amber-700 mt-1">
                                    By providing your digital signature above, you acknowledge that you have read, 
                                    understood, and agree to all terms and conditions outlined in this estimate. 
                                    This constitutes a legally binding agreement between you and {businessSettings?.business_name || 'the contractor'}.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !signatureName.trim() || !hasSignature}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Approving...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve Estimate
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}