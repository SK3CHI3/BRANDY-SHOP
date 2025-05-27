import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, Wand2, Palette, Type, Image, Lightbulb } from 'lucide-react';
import { deepAIService, AIGenerationRequest } from '@/services/deepai';

interface AIPromptBuilderProps {
  productType: string;
  onPromptGenerated: (request: AIGenerationRequest) => void;
  onGenerateImage: (request: AIGenerationRequest) => void;
  isGenerating?: boolean;
}

const AIPromptBuilder: React.FC<AIPromptBuilderProps> = ({
  productType,
  onPromptGenerated,
  onGenerateImage,
  isGenerating = false
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [complexity, setComplexity] = useState<'simple' | 'medium' | 'complex'>('medium');
  const [useGuidedPrompts, setUseGuidedPrompts] = useState(true);
  const [selectedGuidedPrompt, setSelectedGuidedPrompt] = useState('');
  
  const guidedPrompts = deepAIService.getGuidedPrompts(productType);
  const styleModifiers = deepAIService.getStyleModifiers(productType);
  
  const colorOptions = [
    { name: 'Red', value: 'red', hex: '#ef4444' },
    { name: 'Blue', value: 'blue', hex: '#3b82f6' },
    { name: 'Green', value: 'green', hex: '#10b981' },
    { name: 'Yellow', value: 'yellow', hex: '#f59e0b' },
    { name: 'Purple', value: 'purple', hex: '#8b5cf6' },
    { name: 'Orange', value: 'orange', hex: '#f97316' },
    { name: 'Pink', value: 'pink', hex: '#ec4899' },
    { name: 'Black', value: 'black', hex: '#000000' },
    { name: 'White', value: 'white', hex: '#ffffff' },
    { name: 'Gold', value: 'gold', hex: '#fbbf24' }
  ];

  const complexityDescriptions = {
    simple: 'Clean, minimal design with 1-2 colors',
    medium: 'Balanced design with 3-4 colors and moderate detail',
    complex: 'Rich, detailed design with 5+ colors and intricate elements'
  };

  useEffect(() => {
    if (guidedPrompts.length > 0 && !selectedGuidedPrompt) {
      setSelectedGuidedPrompt(guidedPrompts[0]);
    }
  }, [guidedPrompts, selectedGuidedPrompt]);

  const handleColorToggle = (colorValue: string) => {
    setSelectedColors(prev => 
      prev.includes(colorValue) 
        ? prev.filter(c => c !== colorValue)
        : [...prev, colorValue]
    );
  };

  const generatePrompt = () => {
    const basePrompt = useGuidedPrompts ? selectedGuidedPrompt : customPrompt;
    
    const request: AIGenerationRequest = {
      prompt: basePrompt,
      productType,
      style: selectedStyle,
      colors: selectedColors,
      complexity
    };

    onPromptGenerated(request);
  };

  const handleGenerateImage = () => {
    const basePrompt = useGuidedPrompts ? selectedGuidedPrompt : customPrompt;
    
    const request: AIGenerationRequest = {
      prompt: basePrompt,
      productType,
      style: selectedStyle,
      colors: selectedColors,
      complexity
    };

    onGenerateImage(request);
  };

  const getProductTypeDisplay = (type: string) => {
    const displayNames: { [key: string]: string } = {
      tshirt: 'T-Shirt',
      hoodie: 'Hoodie',
      cap: 'Baseball Cap',
      mug: 'Ceramic Mug',
      bag: 'Canvas Bag',
      notebook: 'Notebook',
      polo: 'Polo Shirt',
      jacket: 'Jacket'
    };
    return displayNames[type] || type;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          AI Design Generator for {getProductTypeDisplay(productType)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prompt" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prompt">Prompt</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="guided-prompts"
                checked={useGuidedPrompts}
                onCheckedChange={setUseGuidedPrompts}
              />
              <Label htmlFor="guided-prompts">Use guided prompts</Label>
            </div>

            {useGuidedPrompts ? (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Choose a suggested prompt:</Label>
                <div className="grid gap-2">
                  {guidedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedGuidedPrompt(prompt)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        selectedGuidedPrompt === prompt
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{prompt}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="custom-prompt">Custom prompt:</Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="Describe your design idea in detail..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Style modifiers:</Label>
              <div className="flex flex-wrap gap-2">
                {styleModifiers.map((style) => (
                  <Badge
                    key={style}
                    variant={selectedStyle === style ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedStyle(selectedStyle === style ? '' : style)}
                  >
                    {style}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Color preferences:</Label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorToggle(color.value)}
                    className={`relative w-12 h-12 rounded-lg border-2 transition-all ${
                      selectedColors.includes(color.value)
                        ? 'border-purple-500 scale-110'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColors.includes(color.value) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full border border-gray-300" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {selectedColors.length > 0 && (
                <div className="text-sm text-gray-600">
                  Selected: {selectedColors.join(', ')}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Design complexity:</Label>
              <div className="space-y-2">
                {Object.entries(complexityDescriptions).map(([level, description]) => (
                  <button
                    key={level}
                    onClick={() => setComplexity(level as 'simple' | 'medium' | 'complex')}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      complexity === level
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium capitalize">{level}</div>
                    <div className="text-sm text-gray-600">{description}</div>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            onClick={generatePrompt}
            variant="outline"
            size="lg"
            className="flex-1 min-w-0 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
          >
            <Type className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Preview Prompt</span>
          </Button>
          <Button
            onClick={handleGenerateImage}
            disabled={isGenerating || (!useGuidedPrompts && !customPrompt.trim())}
            size="lg"
            className="flex-1 min-w-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 flex-shrink-0" />
                <span className="truncate">Generating...</span>
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Generate Design</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIPromptBuilder;
