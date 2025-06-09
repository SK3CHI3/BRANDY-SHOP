import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  RotateCcw,
  Palette,
  Plus,
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

interface TextEditorProps {
  selectedElement: DesignElement | null;
  onElementUpdate: (elementId: string, updates: Partial<DesignElement>) => void;
  onAddTextElement: () => void;
  onDeleteElement: (elementId: string) => void;
}

const fontFamilies = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Impact', label: 'Impact' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Lucida Console', label: 'Lucida Console' },
  { value: 'Brush Script MT', label: 'Brush Script MT' },
  { value: 'Papyrus', label: 'Papyrus' }
];

const presetColors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000'
];

const TextEditor: React.FC<TextEditorProps> = ({
  selectedElement,
  onElementUpdate,
  onAddTextElement,
  onDeleteElement
}) => {
  const isTextElement = selectedElement?.type === 'text';

  const handleStyleUpdate = (property: string, value: any) => {
    if (!selectedElement) return;
    
    onElementUpdate(selectedElement.id, {
      style: {
        ...selectedElement.style,
        [property]: value
      }
    });
  };

  const handleContentUpdate = (content: string) => {
    if (!selectedElement) return;
    onElementUpdate(selectedElement.id, { content });
  };

  const toggleBold = () => {
    const currentWeight = selectedElement?.style.fontWeight || 'normal';
    handleStyleUpdate('fontWeight', currentWeight === 'bold' ? 'normal' : 'bold');
  };

  const toggleItalic = () => {
    const currentStyle = selectedElement?.style.fontStyle || 'normal';
    handleStyleUpdate('fontStyle', currentStyle === 'italic' ? 'normal' : 'italic');
  };

  const toggleUnderline = () => {
    const currentDecoration = selectedElement?.style.textDecoration || 'none';
    handleStyleUpdate('textDecoration', currentDecoration === 'underline' ? 'none' : 'underline');
  };

  return (
    <div className="space-y-4">
      {/* Add Text Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Type className="h-5 w-5" />
            Text Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={onAddTextElement} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Text Element
          </Button>
        </CardContent>
      </Card>

      {/* Text Properties */}
      {isTextElement && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Text Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Text Content */}
            <div>
              <Label htmlFor="text-content">Text Content</Label>
              <Textarea
                id="text-content"
                placeholder="Enter your text..."
                value={selectedElement.content}
                onChange={(e) => handleContentUpdate(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <Separator />

            {/* Font Family */}
            <div>
              <Label>Font Family</Label>
              <Select
                value={selectedElement.style.fontFamily || 'Arial'}
                onValueChange={(value) => handleStyleUpdate('fontFamily', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Size */}
            <div>
              <Label htmlFor="font-size">Font Size</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="font-size"
                  type="range"
                  min="8"
                  max="120"
                  value={selectedElement.style.fontSize || 16}
                  onChange={(e) => handleStyleUpdate('fontSize', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-center">
                  {selectedElement.style.fontSize || 16}px
                </span>
              </div>
            </div>

            {/* Text Style Buttons */}
            <div>
              <Label>Text Style</Label>
              <div className="flex gap-1 mt-1">
                <Button
                  variant={selectedElement.style.fontWeight === 'bold' ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleBold}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedElement.style.fontStyle === 'italic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleItalic}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedElement.style.textDecoration === 'underline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleUnderline}
                >
                  <Underline className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Text Alignment */}
            <div>
              <Label>Text Alignment</Label>
              <div className="flex gap-1 mt-1">
                <Button
                  variant={selectedElement.style.textAlign === 'left' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStyleUpdate('textAlign', 'left')}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedElement.style.textAlign === 'center' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStyleUpdate('textAlign', 'center')}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant={selectedElement.style.textAlign === 'right' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStyleUpdate('textAlign', 'right')}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Text Color */}
            <div>
              <Label>Text Color</Label>
              <div className="mt-1">
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    type="color"
                    value={selectedElement.style.color || '#000000'}
                    onChange={(e) => handleStyleUpdate('color', e.target.value)}
                    className="w-12 h-8 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={selectedElement.style.color || '#000000'}
                    onChange={(e) => handleStyleUpdate('color', e.target.value)}
                    className="flex-1 font-mono text-sm"
                    placeholder="#000000"
                  />
                </div>
                
                {/* Preset Colors */}
                <div className="grid grid-cols-5 gap-1">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400"
                      style={{ backgroundColor: color }}
                      onClick={() => handleStyleUpdate('color', color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Text Rotation */}
            <div>
              <Label htmlFor="text-rotation">Rotation</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="text-rotation"
                  type="range"
                  min="-180"
                  max="180"
                  value={selectedElement.style.rotation || 0}
                  onChange={(e) => handleStyleUpdate('rotation', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-center">
                  {selectedElement.style.rotation || 0}°
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStyleUpdate('rotation', 0)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Delete Element */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteElement(selectedElement.id)}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Text Element
            </Button>
          </CardContent>
        </Card>
      )}

      {/* No Selection Message */}
      {!selectedElement && (
        <Card>
          <CardContent className="text-center py-8">
            <Type className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              Add a text element or select an existing one to edit its properties
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TextEditor;
