import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown, 
  Type,
  Image,
  Trash2
} from 'lucide-react';

interface DesignElement {
  id: string;
  type: 'text' | 'image';
  content: string;
  position: { x: number; y: number };
  style: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    color?: string;
    textAlign?: string;
    rotation?: number;
    textDecoration?: string;
  };
  layer: number;
  visible: boolean;
}

interface LayersPanelProps {
  designElements: DesignElement[];
  selectedElementId: string | null;
  onElementSelect: (elementId: string | null) => void;
  onElementUpdate: (elementId: string, updates: Partial<DesignElement>) => void;
  onDeleteElement: (elementId: string) => void;
  onReorderLayers: (elementId: string, direction: 'up' | 'down') => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  designElements,
  selectedElementId,
  onElementSelect,
  onElementUpdate,
  onDeleteElement,
  onReorderLayers
}) => {
  const sortedElements = [...designElements].sort((a, b) => b.layer - a.layer);

  const toggleVisibility = (elementId: string) => {
    const element = designElements.find(el => el.id === elementId);
    if (element) {
      onElementUpdate(elementId, { visible: !element.visible });
    }
  };

  const getElementPreview = (element: DesignElement) => {
    if (element.type === 'text') {
      return element.content.length > 20 
        ? element.content.substring(0, 20) + '...' 
        : element.content || 'Empty Text';
    }
    return 'Image';
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      default:
        return <Type className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5" />
          Layers
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {designElements.length === 0 ? (
          <div className="text-center py-8 px-4">
            <Layers className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-sm">
              No design elements yet. Add some text or images to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedElements.map((element, index) => (
              <div
                key={element.id}
                className={`flex items-center gap-2 p-3 border-b hover:bg-gray-50 cursor-pointer ${
                  selectedElementId === element.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => onElementSelect(element.id)}
              >
                {/* Element Icon */}
                <div className="flex-shrink-0">
                  {getElementIcon(element.type)}
                </div>

                {/* Element Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {getElementPreview(element)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {element.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    Layer {element.layer} • {element.style.fontFamily || 'Default'}
                    {element.style.fontSize && ` • ${element.style.fontSize}px`}
                  </div>
                </div>

                {/* Layer Controls */}
                <div className="flex items-center gap-1">
                  {/* Visibility Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(element.id);
                    }}
                  >
                    {element.visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>

                  {/* Move Up */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderLayers(element.id, 'up');
                    }}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>

                  {/* Move Down */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderLayers(element.id, 'down');
                    }}
                    disabled={index === sortedElements.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteElement(element.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LayersPanel;
