
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, ArrowRight } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { safeFormatDate } from '@/components/lib/formatters';

export default function ClientProjectsList({ projects }) {
  const statusColors = {
    estimate: "bg-amber-100 text-amber-800 border-amber-200",
    active: "bg-emerald-100 text-emerald-800 border-emerald-200",
    service: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-purple-100 text-purple-800 border-purple-200",
    cancelled: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        {projects.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Completion Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map(project => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell><Badge className={statusColors[project.status]}>{project.status}</Badge></TableCell>
                  <TableCell>${(project.actual_cost || project.estimated_cost || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    {safeFormatDate(project.estimated_completion, 'MMM d, yyyy') || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Link to={createPageUrl(`ProjectDetail?id=${project.id}`)}>
                      <ArrowRight className="w-4 h-4 text-slate-500 hover:text-slate-800" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No projects found for this client.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
