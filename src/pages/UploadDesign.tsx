import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import {
  Upload,
  Image as ImageIcon,
  X,
  Plus,
  Tag,
  DollarSign,
  Palette,
  FileImage,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Save,
  Eye
} from 'lucide-react'

interface DesignForm {
  title: string
  description: string
  category_id: string
  tags: string[]
  price: string
  original_price: string
  images: File[]
  colors: string[]
  sizes: string[]
  materials: string[]
  stock_quantity: string
}

const UploadDesign = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [currentTag, setCurrentTag] = useState('')
  const [currentColor, setCurrentColor] = useState('#000000')
  const [categories, setCategories] = useState<any[]>([])
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])

  const [formData, setFormData] = useState<DesignForm>({
    title: '',
    description: '',
    category_id: '',
    tags: [],
    price: '',
    original_price: '',
    images: [],
    colors: [],
    sizes: [],
    materials: [],
    stock_quantity: '10'
  })

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  const availableMaterials = ['Cotton', 'Polyester', 'Cotton Blend', 'Canvas', 'Ceramic', 'Vinyl']

  const handleInputChange = (field: keyof DesignForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB

      if (!isValidType) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload only image files',
          variant: 'destructive',
        })
        return false
      }

      if (!isValidSize) {
        toast({
          title: 'File Too Large',
          description: 'Please upload images smaller than 10MB',
          variant: 'destructive',
        })
        return false
      }

      return true
    })

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles].slice(0, 5) // Max 5 images
    }))
  }

  // Upload images to Supabase storage
  const uploadImages = async (images: File[]): Promise<string[]> => {
    const uploadPromises = images.map(async (file, index) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}_${Date.now()}_${index}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      return data.publicUrl
    })

    return Promise.all(uploadPromises)
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const addColor = () => {
    if (!formData.colors.includes(currentColor)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, currentColor]
      }))
    }
  }

  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }))
  }

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }))
  }

  const toggleMaterial = (material: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.includes(material)
        ? prev.materials.filter(m => m !== material)
        : [...prev.materials, material]
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for your design',
        variant: 'destructive',
      })
      return false
    }

    if (!formData.description.trim()) {
      toast({
        title: 'Description Required',
        description: 'Please enter a description for your design',
        variant: 'destructive',
      })
      return false
    }

    if (!formData.category_id) {
      toast({
        title: 'Category Required',
        description: 'Please select a category for your design',
        variant: 'destructive',
      })
      return false
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: 'Valid Price Required',
        description: 'Please enter a valid price for your design',
        variant: 'destructive',
      })
      return false
    }

    if (formData.images.length === 0) {
      toast({
        title: 'Images Required',
        description: 'Please upload at least one image of your design',
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setUploading(true)

    try {
      // Upload images to Supabase storage
      const imageUrls = await uploadImages(formData.images)

      // Create product in database
      const { data, error } = await supabase
        .from('products')
        .insert({
          artist_id: user!.id,
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id || null,
          price: parseFloat(formData.price),
          original_price: formData.original_price ? parseFloat(formData.original_price) : null,
          image_url: imageUrls[0], // Main image
          additional_images: imageUrls.slice(1), // Additional images
          tags: formData.tags,
          colors: formData.colors,
          sizes: formData.sizes,
          materials: formData.materials,
          stock_quantity: parseInt(formData.stock_quantity),
          is_active: true
        })
        .select()

      if (error) throw error

      toast({
        title: 'Design Uploaded Successfully!',
        description: 'Your design is now live in the marketplace!',
      })

      // Reset form
      setFormData({
        title: '',
        description: '',
        category_id: '',
        tags: [],
        price: '',
        original_price: '',
        images: [],
        colors: [],
        sizes: [],
        materials: [],
        stock_quantity: '10'
      })

      navigate('/artist-studio')
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const saveDraft = () => {
    toast({
      title: 'Draft Saved',
      description: 'Your design has been saved as a draft',
    })
  }

  if (!user || (profile && profile.role !== 'artist')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Palette className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Artist Access Required</h1>
            <p className="text-gray-600 mb-4">This page is only available for artists</p>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/artist-studio')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Studio
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload New Design</h1>
          <p className="text-gray-600">
            Share your creativity with the world and start earning
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Design Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter a catchy title for your design"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your design, inspiration, and what makes it special"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="original_price">Original Price (KSh) - Optional</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="original_price"
                      type="number"
                      placeholder="0"
                      className="pl-10"
                      value={formData.original_price}
                      onChange={(e) => handleInputChange('original_price', e.target.value)}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Set if this is a discounted price
                  </p>
                </div>

                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="10"
                    value={formData.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    How many items are available
                  </p>
                </div>

                <div>
                  <Label htmlFor="price">Price (KSh) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="price"
                      type="number"
                      placeholder="0"
                      className="pl-10"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Design Images *
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Upload Area */}
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Click to upload images or drag and drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB (Max 5 images)</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Uploaded Images */}
                  {formData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.images.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {index === 0 && (
                            <Badge className="absolute bottom-2 left-2 bg-orange-500">
                              Main
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tags (e.g., wildlife, traditional, modern)"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} disabled={!currentTag.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="flex items-center gap-1">
                          {tag}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Available Colors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(e) => setCurrentColor(e.target.value)}
                      className="w-10 h-10 rounded border"
                    />
                    <Button onClick={addColor} className="flex-1">
                      Add Color
                    </Button>
                  </div>

                  {formData.colors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.colors.map(color => (
                        <div
                          key={color}
                          className="relative group cursor-pointer"
                          onClick={() => removeColor(color)}
                        >
                          <div
                            className="w-8 h-8 rounded border-2 border-gray-300"
                            style={{ backgroundColor: color }}
                          />
                          <X className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sizes */}
            <Card>
              <CardHeader>
                <CardTitle>Available Sizes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {availableSizes.map(size => (
                    <Button
                      key={size}
                      variant={formData.sizes.includes(size) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Materials */}
            <Card>
              <CardHeader>
                <CardTitle>Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableMaterials.map(material => (
                    <Button
                      key={material}
                      variant={formData.materials.includes(material) ? 'default' : 'outline'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => toggleMaterial(material)}
                    >
                      {material}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Upload Design
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={saveDraft}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Upload Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Use high-resolution images (300 DPI minimum)</li>
                  <li>• Ensure designs are original or properly licensed</li>
                  <li>• Include multiple angles/views when possible</li>
                  <li>• Write descriptive titles and tags</li>
                  <li>• Price competitively based on complexity</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default UploadDesign
