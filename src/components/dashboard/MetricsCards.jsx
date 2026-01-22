import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export default function MetricsCards({ title, value, icon: Icon, change, changeType }) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-emerald-600';
      case 'negative': return 'text-red-500';
      default: return 'text-slate-500';
    }
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return TrendingUp;
    if (changeType === 'negative') return TrendingDown;
    return null;
  };

  const ChangeIcon = getChangeIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-slate-700" />
          </div>
          {change && ChangeIcon && (
            <div className={`flex items-center gap-1 ${getChangeColor()}`}>
              <ChangeIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{change}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-600 font-medium">{title}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}