import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ComponentPalette({ onAddComponent, componentTypes }) {
  
  const chartExamples = {
    barChart: "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=📊+Monthly+Revenue",
    pieChart: "https://via.placeholder.com/300x200/10B981/FFFFFF?text=🥧+Expense+Breakdown", 
    lineChart: "https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=📈+Payment+Timeline"
  };

  const componentGroups = [
    {
      title: 'Content',
      components: ['text', 'image', 'table']
    },
    {
      title: 'Data Visualization', 
      components: ['barChart', 'pieChart', 'lineChart']
    },
    {
      title: 'Fields',
      components: ['currency', 'date']
    }
  ];

  return (
    <div className="space-y-6">
      {componentGroups.map(group => (
        <div key={group.title}>
          <h3 className="font-semibold text-sm mb-3 text-slate-700">{group.title}</h3>
          <div className="grid gap-3">
            {group.components.map(type => {
              const component = componentTypes[type];
              const hasExample = chartExamples[type];
              
              return (
                <Card 
                  key={type} 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 border-slate-200 hover:border-emerald-300"
                  onClick={() => onAddComponent(type)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${component.color} flex items-center justify-center`}>
                        <component.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-sm">{component.label}</CardTitle>
                        <p className="text-xs text-slate-500 mt-1">{component.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {hasExample && (
                    <CardContent className="pt-0">
                      <div className="relative">
                        <img 
                          src={hasExample} 
                          alt={`${component.label} example`}
                          className="w-full h-20 object-cover rounded border bg-slate-50"
                        />
                        <Badge className="absolute top-1 right-1 text-xs bg-white/90 text-slate-700">
                          Preview
                        </Badge>
                      </div>
                    </CardContent>
                  )}
                  
                  <CardContent className="pt-2">
                    <Button 
                      size="sm" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddComponent(type);
                      }}
                    >
                      Add {component.label}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            💡
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Pro Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Drag components to reorder them</li>
              <li>• Click any component to edit its properties</li>
              <li>• Use the AI assistant for custom components</li>
              <li>• Generate test PDFs to see the final result</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}