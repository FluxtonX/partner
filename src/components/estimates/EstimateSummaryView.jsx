import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Percent, Mail, MessageSquare, ArrowUpRight, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from "sonner";
import { sendClientEmail } from "@/api/functions";
import { Conversation, ConversationParticipant } from '@/api/entities';

const FinancialMetric = ({ label, value, isPercentage = false, className = '' }) => (
    <div className="flex justify-between items-center text-sm">
        <p className="text-slate-600">{label}</p>
        <p className={`font-medium text-slate-800 ${className}`}>
            {isPercentage ? `${(value * 100).toFixed(1)}%` : `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </p>
    </div>
);

const PARTNER_FEE_RATES = {
  'Trial': 0.09,
  'Starter': 0.09,
  'Partner': 0.07,
  'Enterprise': 0,
  'Enterprise Annual': 0,
  'Inactive': 0.09,
};

export default function EstimateSummaryView({ estimate, client, assignedUser, businessSettings, currentUser, onClear }) {
    const navigate = useNavigate();

    if (!estimate) {
        return (
            <Card className="sticky top-8 h-full flex items-center justify-center border-dashed bg-slate-50/50">
                <div className="text-center p-4">
                    <p className="text-slate-500 font-medium">Select an estimate</p>
                    <p className="text-sm text-slate-400">View detailed summary and quick actions here.</p>
                </div>
            </Card>
        );
    }
    
    // Calculations
    const totalDirectCost = (estimate.estimated_labor_cost || 0) + (estimate.estimated_materials_cost || 0);
    const sellingPrice = (estimate.subtotal || 0) + (estimate.overall_adjustment || 0);
    const grossProfit = sellingPrice - totalDirectCost;
    const grossMargin = sellingPrice > 0 ? grossProfit / sellingPrice : 0;
    
    const partnerFeeRate = businessSettings?.subscription_type ? (PARTNER_FEE_RATES[businessSettings.subscription_type] || 0.09) : 0.09;
    const partnerFee = sellingPrice * partnerFeeRate;

    const netProfit = grossProfit - partnerFee;
    const netMargin = sellingPrice > 0 ? netProfit / sellingPrice : 0;

    const handleEmailClient = async () => {
        if (!client || !currentUser) {
            toast.error("Client or current user data is missing.");
            return;
        }
        
        const subject = `Regarding Estimate: ${estimate.title}`;
        const body = `Hi ${client.contact_person},\n\nI'm reaching out regarding your estimate for "${estimate.title}".\n\nPlease let me know if you have any questions.\n\nBest,\n${currentUser.full_name}`;
        
        try {
            await sendClientEmail({
                to: client.email,
                subject: subject,
                body: body,
                from_name: currentUser.full_name,
            });
            toast.success(`Email prepared for ${client.contact_person}.`);
            window.open(`mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);

        } catch (error) {
            toast.error("Failed to prepare email.");
            console.error(error);
        }
    };

    const handleMessageUser = async () => {
        if (!assignedUser || !assignedUser.email || !currentUser) {
            toast.error("No user assigned or current user data is missing.");
            return;
        }
        
        try {
            const existingConversations = await ConversationParticipant.filter({ user_email: currentUser.email });
            const participantConversations = await ConversationParticipant.filter({ user_email: assignedUser.email });

            const commonConversation = existingConversations.find(c1 => 
                participantConversations.some(c2 => c1.conversation_id === c2.conversation_id)
            );

            let conversationId;
            if (commonConversation) {
                conversationId = commonConversation.conversation_id;
            } else {
                const newConversation = await Conversation.create({ type: 'direct' });
                await ConversationParticipant.bulkCreate([
                    { conversation_id: newConversation.id, user_email: currentUser.email },
                    { conversation_id: newConversation.id, user_email: assignedUser.email }
                ]);
                conversationId = newConversation.id;
            }
            
            navigate(createPageUrl(`Messenger?conversationId=${conversationId}`));

        } catch (error) {
            toast.error("Failed to start conversation.");
            console.error(error);
        }
    };

    return (
        <Card className="sticky top-8 h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl border-slate-300">
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle className="text-lg">{estimate.title}</CardTitle>
                    <CardDescription>{client?.contact_person || 'No client'}</CardDescription>
                </div>
                 <Button variant="ghost" size="icon" onClick={onClear} className="h-8 w-8">
                     <X className="w-4 h-4" />
                 </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Financials</h4>
                    <div className="space-y-2">
                        <FinancialMetric label="Subtotal" value={estimate.subtotal || 0} />
                        <FinancialMetric label="Tax" value={estimate.tax_amount || 0} />
                        <FinancialMetric label="Adjustments" value={estimate.overall_adjustment || 0} className={(estimate.overall_adjustment || 0) >= 0 ? 'text-slate-800' : 'text-emerald-600'}/>
                        <Separator className="my-2" />
                        <FinancialMetric label="Total Price" value={estimate.total_after_adjustments || 0} className="font-bold text-lg" />
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Profitability</h4>
                    <div className="space-y-2">
                        <FinancialMetric label="Total Direct Cost" value={totalDirectCost} />
                        <FinancialMetric label="Gross Profit" value={grossProfit} className={grossProfit >= 0 ? 'text-emerald-600' : 'text-red-500'} />
                        <FinancialMetric label="Gross Margin" value={grossMargin} isPercentage className={grossMargin >= (businessSettings?.minimum_profit_margin || 0) ? 'text-emerald-600' : 'text-red-500'} />
                        <Separator className="my-2" />
                        <FinancialMetric label="Partner Fee" value={partnerFee} />
                         <FinancialMetric label="Net Profit" value={netProfit} className="font-bold" />
                        <FinancialMetric label="Net Margin" value={netMargin} isPercentage className="font-bold"/>
                    </div>
                     {netMargin < (businessSettings?.minimum_profit_margin || 0) && (
                        <Badge variant="destructive" className="mt-3">Margin below target</Badge>
                     )}
                </div>

                <div>
                     <h4 className="font-semibold text-slate-800 mb-3">Quick Actions</h4>
                     <div className="space-y-2">
                         <Button variant="outline" className="w-full justify-start gap-2" onClick={handleEmailClient} disabled={!client}>
                            <Mail className="w-4 h-4"/> Email Client ({client?.contact_person || 'N/A'})
                         </Button>
                         <Button variant="outline" className="w-full justify-start gap-2" onClick={handleMessageUser} disabled={!assignedUser}>
                            <MessageSquare className="w-4 h-4"/> Message Assignee ({assignedUser?.full_name || 'N/A'})
                         </Button>
                         <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate(createPageUrl(`Estimates?id=${estimate.id}`))}>
                             <ArrowUpRight className="w-4 h-4"/> View Full Estimate
                         </Button>
                     </div>
                </div>
            </CardContent>
        </Card>
    );
}