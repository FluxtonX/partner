import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Client } from '@/api/entities';
import { toast } from 'sonner';
import { 
  User, 
  Building, 
  Mail, 
  Phone,
  MapPin, 
  Edit,
  Eye,
  MoreVertical,
  Users
} from 'lucide-react';

const columnStatuses = ['new_lead', 'attempted_contact', 'contacted', 'estimate', 'won', 'lost'];

const statusStyles = {
  new_lead: { title: 'New Leads', color: 'bg-blue-500', bgColor: 'bg-blue-50' },
  attempted_contact: { title: 'Attempted Contact', color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
  contacted: { title: 'Contacted', color: 'bg-purple-500', bgColor: 'bg-purple-50' },
  estimate: { title: 'Estimate Sent', color: 'bg-indigo-500', bgColor: 'bg-indigo-50' },
  won: { title: 'Won', color: 'bg-green-500', bgColor: 'bg-green-50' },
  lost: { title: 'Lost', color: 'bg-red-500', bgColor: 'bg-red-50' },
};

function ClientCard({ client, onEdit, onView }) {
  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              client.client_type === 'commercial' ? 'bg-blue-100' : 'bg-emerald-100'
            }`}>
              {client.client_type === 'commercial' ? 
                <Building className="w-4 h-4 text-blue-600" /> : 
                <User className="w-4 h-4 text-emerald-600" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-800 text-sm truncate">
                {client.contact_person || `${client.first_name} ${client.last_name}`.trim() || 'Unnamed Client'}
              </h4>
              {client.company_name && (
                <p className="text-xs text-slate-500 truncate">{client.company_name}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{client.phone}</span>
          </div>
          
          {client.address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">{client.address}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {client.referral_source && (
              <span>Source: {client.referral_source.replace('_', ' ')}</span>
            )}
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(client);
              }}
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(client);
              }}
            >
              <Edit className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientKanbanBoard({ clients, onEdit, onView, onDataReload }) {
  const [columns, setColumns] = useState({});

  useEffect(() => {
    const groupedClients = clients.reduce((acc, client) => {
      const status = client.status || 'new_lead';
      (acc[status] = acc[status] || []).push(client);
      return acc;
    }, {});
    
    const initialColumns = columnStatuses.reduce((acc, status) => {
      acc[status] = {
        ...statusStyles[status],
        items: groupedClients[status] || []
      };
      return acc;
    }, {});
    
    setColumns(initialColumns);
  }, [clients]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1);

    // Update UI optimistically
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [destination.droppableId]: {
        ...destColumn,
        items: [...destItems.slice(0, destination.index), removed, ...destItems.slice(destination.index)],
      },
    });

    try {
      await Client.update(draggableId, { status: destination.droppableId });
      const clientName = removed.contact_person || `${removed.first_name} ${removed.last_name}`.trim() || 'Client';
      const statusLabel = statusStyles[destination.droppableId].title;
      toast.success(`${clientName} moved to ${statusLabel}`);
      onDataReload?.();
    } catch (error) {
      console.error("Failed to update client status:", error);
      toast.error("Failed to update client status");
      // Revert UI change on error
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: [...sourceItems, removed],
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {columnStatuses.map(status => {
            const column = columns[status];
            if (!column) return null;

            return (
              <Droppable key={status} droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-shrink-0 w-80 rounded-xl transition-colors ${
                      snapshot.isDraggingOver ? 'bg-slate-200' : column.bgColor
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                          <h3 className="font-semibold text-slate-800">{column.title}</h3>
                        </div>
                        <Badge variant="secondary" className="bg-white/70">
                          {column.items.length}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto">
                        {column.items.map((client, index) => (
                          <Draggable key={client.id} draggableId={client.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  transform: snapshot.isDragging 
                                    ? `${provided.draggableProps.style?.transform} rotate(5deg)`
                                    : provided.draggableProps.style?.transform,
                                }}
                                className={snapshot.isDragging ? 'z-50' : ''}
                              >
                                <ClientCard
                                  client={client}
                                  onEdit={onEdit}
                                  onView={onView}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </div>
    </DragDropContext>
  );
}