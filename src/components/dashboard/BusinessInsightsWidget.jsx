
import React, { useState, useEffect } from 'react';
import { BusinessInsight, User } from '@/api/entities';
import { generateMonthlyInsights } from '@/api/functions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, DollarSign, BarChart, HardHat, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const insightIcons = {
  top_expenses: <DollarSign className="w-5 h-5 text-red-500" />,
  profitability: <BarChart className="w-5 h-5 text-emerald-500" />,
  labor_variance: <HardHat className="w-5 h-5 text-amber-500" />,
  other: <Lightbulb className="w-5 h-5 text-blue-500" />,
};

export default function BusinessInsightsWidget() {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);
        const insightData = await BusinessInsight.filter({ business_id: user.current_business_id }, "-generated_date", 3);
        setInsights(insightData);
      } catch (error) {
        console.error('Error loading insights:', error);
        toast.error('Failed to load business insights.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.info('Generating new insights... This may take a moment.');
    try {
      await generateMonthlyInsights();
      // Reload insights after generation
      const insightData = await BusinessInsight.filter({ business_id: currentUser.current_business_id }, "-generated_date", 3);
      setInsights(insightData);
      toast.success('Business insights have been updated!');
    } catch (error) {
      console.error('Error refreshing insights:', error);
      toast.error('Failed to generate new insights. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  if (isLoading) {
    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader><CardTitle>AI Business Insights</CardTitle></CardHeader>
            <CardContent><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" /></CardContent>
        </Card>
    );
  }
  
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600" />
          AI Business Insights
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span className="ml-2">{isRefreshing ? 'Refreshing...' : 'Refresh Now'}</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length > 0 ? (
          insights.map(insight => (
            <Alert key={insight.id}>
              <div className="flex items-start gap-3">
                <div className="pt-1">{insightIcons[insight.insight_type] || insightIcons.other}</div>
                <div>
                  <AlertTitle>{insight.title}</AlertTitle>
                  <AlertDescription>{insight.description}</AlertDescription>
                </div>
              </div>
            </Alert>
          ))
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-600">No Insights Yet</h3>
            <p className="text-sm text-slate-500">
              Click "Refresh Now" to generate your first set of business insights for the previous month.
            </p>
          </div>
        )}
        <p className="text-xs text-slate-400 text-center pt-2">
          Insights are based on data from the previous full calendar month and are refreshed automatically.
        </p>
      </CardContent>
    </Card>
  );
}
