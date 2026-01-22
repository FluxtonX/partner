import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProjectCard from './ProjectCard';
import { Project } from '@/api/entities';

const columnStatuses = ['estimate', 'active', 'service', 'completed', 'cancelled'];

const statusStyles = {
  estimate: { title: 'Estimates', color: 'bg-amber-500' },
  active: { title: 'Active Projects', color: 'bg-emerald-500' },
  service: { title: 'Service', color: 'bg-blue-500' },
  completed: { title: 'Completed', color: 'bg-purple-500' },
  cancelled: { title: 'Cancelled', color: 'bg-red-500' },
};

export default function KanbanBoard({ projects, clients, users, onEdit, onDataReload }) {
  const [columns, setColumns] = useState({});

  useEffect(() => {
    const groupedProjects = projects.reduce((acc, project) => {
      (acc[project.status] = acc[project.status] || []).push(project);
      return acc;
    }, {});
    
    const initialColumns = columnStatuses.reduce((acc, status) => {
      acc[status] = {
        ...statusStyles[status],
        items: groupedProjects[status] || []
      };
      return acc;
    }, {});
    
    setColumns(initialColumns);
  }, [projects]);

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.company_name || 'Unknown Client';
  };

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };
  
  const getProjectTitle = (projectId) => {
      const project = projects.find(p => p.id === projectId);
      return project?.title || 'Unknown Project';
  };


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
      await Project.update(draggableId, { status: destination.droppableId });
      // Optionally reload all data to ensure consistency, or trust the optimistic update.
      onDataReload(); 
    } catch (error) {
      console.error("Failed to update project status:", error);
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
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columnStatuses.map(status => {
          const column = columns[status];
          if (!column) return null;

          return (
            <Droppable key={status} droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-shrink-0 w-80 bg-slate-100 rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-slate-200' : ''}`}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                        <h3 className="font-semibold text-slate-800">{column.title}</h3>
                      </div>
                      <Badge variant="secondary">{column.items.length}</Badge>
                    </div>
                    
                    <div className="space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2">
                      {column.items.map((project, index) => (
                        <Draggable key={project.id} draggableId={project.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                boxShadow: snapshot.isDragging ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
                              }}
                            >
                              <ProjectCard
                                project={project}
                                clientName={getClientName(project.client_id)}
                                assignedUser={getUserName(project.assigned_to)}
                                parentTitle={getProjectTitle(project.parent_project_id)}
                                onEdit={onEdit}
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
    </DragDropContext>
  );
}