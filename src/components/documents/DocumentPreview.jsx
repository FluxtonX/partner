
import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Move, Eye } from 'lucide-react';

export default function DocumentPreview({ template, documentType, sampleData, onComponentReorder, isEditable = false }) {
  if (!template || !template.layout || !template.layout.components) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          📄
        </div>
        <p>No components added yet</p>
        <p className="text-sm">Add components from the sidebar to see your template</p>
      </div>
    );
  }

  // Enhanced variable replacement with better formatting
  const replaceVariables = (text, data) => {
    if (!text || typeof text !== 'string') return text;
    
    return text.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
      const keys = variable.trim().split('.');
      let value = data;
      
      for (const key of keys) {
        if (value === null || value === undefined) {
          value = undefined; // If any part of the path is null/undefined, the whole path is undefined
          break;
        }
        value = value[key];
      }
      
      // Format different data types appropriately
      if (value === null || value === undefined) {
        return `[${variable}]`; // Show missing variables clearly
      }
      
      if (typeof value === 'number' && variable.toLowerCase().includes('amount')) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      }
      
      if (typeof value === 'string' && (variable.toLowerCase().includes('date') || variable.toLowerCase().includes('datetime'))) {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) { // Check if it's a valid date
            return date.toLocaleDateString();
          } else {
            return value; // Return original string if it's not a valid date
          }
        } catch {
          return value; // Return original string on error
        }
      }
      
      return String(value);
    });
  };

  // Removed formatCurrency and formatDate helper functions as their logic is now integrated into replaceVariables or specific component renders.

  const handleDragEnd = (result) => {
    if (!result.destination || !onComponentReorder) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex !== destinationIndex) {
      onComponentReorder(sourceIndex, destinationIndex);
    }
  };

  const renderComponent = (component, index) => {
    const { type, props, styles } = component;
    const componentStyle = {
      margin: styles?.margin || '10px 0',
      padding: styles?.padding || '10px',
      backgroundColor: styles?.backgroundColor || 'transparent',
      borderRadius: styles?.borderRadius || '0px',
      textAlign: styles?.textAlign || 'left',
      ...styles // Apply any other custom styles from the 'styles' object
    };

    switch (type) {
      case 'text':
        return (
          // key prop is handled by the parent map/Draggable component
          <div style={componentStyle} className="text-component">
            <div
              style={{
                fontSize: props.fontSize || '14px',
                fontWeight: props.fontWeight || 'normal',
                whiteSpace: 'pre-line',
                lineHeight: '1.5'
              }}
            >
              {replaceVariables(props.content, sampleData)}
            </div>
          </div>
        );

      case 'image':
        return (
          <div style={componentStyle} className="image-component">
            <div style={{ textAlign: styles?.textAlign || 'center' }}>
              {props.src ? (
                <img
                  src={props.src}
                  alt={props.alt || 'Image'}
                  style={{
                    width: props.width || '200px',
                    height: props.height || 'auto',
                    maxWidth: '100%'
                  }}
                />
              ) : (
                <div 
                  style={{
                    width: props.width || '200px',
                    height: props.height || '80px',
                    backgroundColor: '#f1f5f9',
                    border: '2px dashed #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    color: '#64748b',
                    margin: '0 auto'
                  }}
                >
                  🖼️ {props.alt || 'Image placeholder'}
                </div>
              )}
            </div>
          </div>
        );

      case 'table':
        const tableData = sampleData[props.dataSource] || [];
        return (
          <div style={componentStyle} className="table-component">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  {props.columns?.map((col, idx) => (
                    <th
                      key={idx}
                      className="border border-gray-300 px-4 py-2 text-left font-semibold"
                      style={{ width: col.width }}
                    >
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {props.columns?.map((col, colIdx) => (
                      <td key={colIdx} className="border border-gray-300 px-4 py-2">
                        {col.key.includes('Price') || col.key.includes('total') || col.key.includes('Total') ? 
                          new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row[col.key] || 0) :
                          row[col.key] || ''
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'currency':
        const currencyValue = sampleData[props.field] || 0;
        const formattedCurrency = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(currencyValue);
        
        return (
          <div style={componentStyle} className="currency-component">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="font-medium text-gray-700">{props.label}:</span>
              <span className="text-2xl font-bold text-green-600">{formattedCurrency}</span>
            </div>
          </div>
        );

      case 'date':
        const dateValue = sampleData[props.field];
        const formattedDate = dateValue ? new Date(dateValue).toLocaleDateString() : 'Not set';
        
        return (
          <div style={componentStyle} className="date-component">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">{props.label}:</span>
              <span className="text-gray-900">{formattedDate}</span>
            </div>
          </div>
        );

      case 'barChart':
      case 'pieChart':
      case 'lineChart':
        const chartData = sampleData[props.dataSource] || [];
        return (
          <div style={componentStyle} className="chart-component">
            <div style={{
              height: props.height || '300px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0', 
                fontSize: '16px', 
                fontWeight: '600',
                color: template.styles?.primaryColor || '#059669'
              }}>
                {props.title || 'Chart'}
              </h3>
              <div style={{
                width: '200px',
                height: '150px',
                backgroundColor: 'white',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px'
              }}>
                {type === 'barChart' && '📊'}
                {type === 'pieChart' && '🥧'}
                {type === 'lineChart' && '📈'}
              </div>
              <p style={{ 
                margin: '10px 0 0 0', 
                fontSize: '12px', 
                color: '#64748b',
                textAlign: 'center'
              }}>
                {chartData.length} data points • {type.replace('Chart', ' Chart')}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div style={componentStyle} className="unknown-component">
            <div style={{
              padding: '20px',
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              Unknown component type: {type}
            </div>
          </div>
        );
    }
  };

  const documentContent = (
    <div style={{
      fontFamily: template.styles?.fontFamily || 'Inter, sans-serif',
      backgroundColor: template.styles?.backgroundColor || '#ffffff',
      color: template.styles?.textColor || '#1f2937',
      fontSize: template.styles?.fontSize || '14px',
      padding: '40px',
      minHeight: '100%',
      lineHeight: '1.5'
    }}>
      {template.layout.components.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#64748b'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📄</div>
          <h3>Your Template Preview</h3>
          <p>Add components from the sidebar to see your template come to life</p>
        </div>
      ) : (
        <>
          {/* Preview Mode Indicator */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isEditable ? 'Interactive Preview - Hover over components to reorder them' : 'Document Preview'}
              </span>
            </div>
          </div>
          
          {isEditable ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="preview-components">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`min-h-[200px] ${
                      snapshot.isDraggingOver ? 'bg-blue-50/50 border-2 border-dashed border-blue-300 rounded-lg' : ''
                    }`}
                  >
                    {template.layout.components.map((component, index) => (
                      <Draggable key={component.id} draggableId={component.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`group relative transition-all duration-200 ${
                              snapshot.isDragging ? 'opacity-50 transform rotate-1 scale-105 z-50' : ''
                            }`}
                            style={{
                              border: snapshot.isDragging ? '2px dashed #3b82f6' : '2px solid transparent',
                              borderRadius: '8px',
                              position: 'relative'
                            }}
                          >
                            {/* Drag Handle Overlay */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                              <div className="absolute top-2 right-2 bg-white shadow-lg rounded-lg px-2 py-1 border border-slate-200">
                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                  <Move className="w-3 h-3" />
                                  Drag to reorder
                                </div>
                              </div>
                              <div className="absolute inset-0 bg-blue-50/30 border-2 border-blue-200 rounded-lg pointer-events-none"></div>
                            </div>
                            
                            {/* Component Content */}
                            <div className="relative">{renderComponent(component, index)}</div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            template.layout.components.map((component, index) => 
              <div key={component.id}> {/* Key added to the wrapper div when not editable */}
                {renderComponent(component, index)}
              </div>
            )
          )}
        </>
      )}
    </div>
  );

  return documentContent;
}
