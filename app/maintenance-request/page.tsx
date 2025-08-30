'use client'

import { useState } from 'react'
import { TopNavigation, BottomNavigation } from '@/components/ui/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Wrench, 
  AlertTriangle, 
  Upload, 
  CheckCircle,
  Clock,
  Phone,
  Mail,
  X
} from 'lucide-react'
import Link from 'next/link'

interface MaintenanceFormData {
  tenantName: string
  tenantEmail: string
  tenantPhone: string
  propertyAddress: string
  issueTitle: string
  issueDescription: string
  category: string
  priority: string
  isEmergency: boolean
  preferredContactTime: string
  additionalNotes: string
}

export default function MaintenanceRequestPage() {
  const [formData, setFormData] = useState<MaintenanceFormData>({
    tenantName: '',
    tenantEmail: '',
    tenantPhone: '',
    propertyAddress: '',
    issueTitle: '',
    issueDescription: '',
    category: 'general',
    priority: 'medium',
    isEmergency: false,
    preferredContactTime: 'anytime',
    additionalNotes: ''
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + imageFiles.length > 5) {
      setError('Maximum 5 images allowed')
      return
    }
    
    setImageFiles([...imageFiles, ...files])
    setError('')
  }

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Prepare form data for submission
      const submitData = new FormData()
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString())
      })
      
      // Add images
      imageFiles.forEach((file, index) => {
        submitData.append(`image_${index}`, file)
      })

      const response = await fetch('/api/send-maintenance-email', {
        method: 'POST',
        body: submitData,
      })

      if (!response.ok) {
        throw new Error('Failed to submit maintenance request')
      }

      setSuccess(true)
      setFormData({
        tenantName: '',
        tenantEmail: '',
        tenantPhone: '',
        propertyAddress: '',
        issueTitle: '',
        issueDescription: '',
        category: 'general',
        priority: 'medium',
        isEmergency: false,
        preferredContactTime: 'anytime',
        additionalNotes: ''
      })
      setImageFiles([])
    } catch (error: any) {
      setError(error.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavigation />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="text-center">
            <CardContent className="p-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Maintenance Request Submitted!
              </h1>
              <p className="text-gray-600 mb-8">
                Your maintenance request has been received and assigned a priority level. 
                Our team will contact you within 24 hours to schedule the repair.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button className="bg-[#FF5A5F] hover:bg-[#E8474B]">
                    Back to Home
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  onClick={() => setSuccess(false)}
                >
                  Submit Another Request
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Maintenance Request
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Report maintenance issues quickly and easily. Our team will prioritize 
              and address your request promptly to ensure your property is well-maintained.
            </p>
          </div>
        </div>

        {/* Emergency Notice */}
        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Emergency Repairs:</strong> For urgent issues like gas leaks, electrical hazards, 
            or flooding, please call us immediately at{' '}
            <a href="tel:+64277771486" className="font-semibold underline">
              +64 27 777 1486
            </a>
          </AlertDescription>
        </Alert>

        {/* Priority Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Priority Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Badge variant="destructive" className="mb-2">Emergency</Badge>
                <p className="text-sm text-gray-600">Safety hazards, flooding, no power/heat</p>
              </div>
              <div className="text-center">
                <Badge className="mb-2 bg-orange-500">High</Badge>
                <p className="text-sm text-gray-600">Broken appliances, heating issues</p>
              </div>
              <div className="text-center">
                <Badge className="mb-2 bg-yellow-500">Medium</Badge>
                <p className="text-sm text-gray-600">Minor leaks, door/window issues</p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-2">Low</Badge>
                <p className="text-sm text-gray-600">Cosmetic issues, general maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Wrench className="h-6 w-6 mr-3 text-[#FF5A5F]" />
              Submit Maintenance Request
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="tenantName">Full Name *</Label>
                    <Input
                      id="tenantName"
                      name="tenantName"
                      value={formData.tenantName}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenantEmail">Email Address *</Label>
                    <Input
                      id="tenantEmail"
                      name="tenantEmail"
                      type="email"
                      value={formData.tenantEmail}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenantPhone">Phone Number *</Label>
                    <Input
                      id="tenantPhone"
                      name="tenantPhone"
                      type="tel"
                      value={formData.tenantPhone}
                      onChange={handleInputChange}
                      placeholder="+64 27 123 4567"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
                <div>
                  <Label htmlFor="propertyAddress">Property Address *</Label>
                  <Input
                    id="propertyAddress"
                    name="propertyAddress"
                    value={formData.propertyAddress}
                    onChange={handleInputChange}
                    placeholder="123 Queen Street, Auckland Central"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Issue Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Details</h3>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="issueTitle">Issue Title *</Label>
                    <Input
                      id="issueTitle"
                      name="issueTitle"
                      value={formData.issueTitle}
                      onChange={handleInputChange}
                      placeholder="e.g., Leaking tap in kitchen"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                        required
                      >
                        <option value="general">General Maintenance</option>
                        <option value="plumbing">Plumbing</option>
                        <option value="electrical">Electrical</option>
                        <option value="heating">Heating/Cooling</option>
                        <option value="appliances">Appliances</option>
                        <option value="doors_windows">Doors & Windows</option>
                        <option value="flooring">Flooring</option>
                        <option value="painting">Painting</option>
                        <option value="garden">Garden/Exterior</option>
                        <option value="security">Security</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority Level *</Label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                        required
                      >
                        <option value="low">Low - Can wait a week</option>
                        <option value="medium">Medium - Within a few days</option>
                        <option value="high">High - Within 24 hours</option>
                        <option value="urgent">Urgent - Same day</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isEmergency"
                      name="isEmergency"
                      checked={formData.isEmergency}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-[#FF5A5F] focus:ring-[#FF5A5F]"
                    />
                    <Label htmlFor="isEmergency" className="text-sm font-medium text-red-600">
                      This is an emergency (safety hazard, flooding, no power/heat)
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="issueDescription">Detailed Description *</Label>
                    <Textarea
                      id="issueDescription"
                      name="issueDescription"
                      value={formData.issueDescription}
                      onChange={handleInputChange}
                      placeholder="Please describe the issue in detail, including when it started, what you've tried, and any relevant circumstances..."
                      rows={5}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                      Photos (Optional - Max 5)
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <div className="text-sm text-gray-600 mb-4">
                          <label htmlFor="image-upload" className="cursor-pointer">
                            <span className="text-[#FF5A5F] hover:text-[#E8474B] font-medium">
                              Click to upload
                            </span>{' '}
                            or drag and drop
                          </label>
                          <input
                            id="image-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                      </div>
                    </div>

                    {imageFiles.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="preferredContactTime">Best Time to Contact</Label>
                    <select
                      id="preferredContactTime"
                      name="preferredContactTime"
                      value={formData.preferredContactTime}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                    >
                      <option value="anytime">Anytime</option>
                      <option value="morning">Morning (8am - 12pm)</option>
                      <option value="afternoon">Afternoon (12pm - 5pm)</option>
                      <option value="evening">Evening (5pm - 8pm)</option>
                      <option value="weekends">Weekends only</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="additionalNotes">Additional Notes</Label>
                    <Textarea
                      id="additionalNotes"
                      name="additionalNotes"
                      value={formData.additionalNotes}
                      onChange={handleInputChange}
                      placeholder="Any additional information that might help our maintenance team..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Response Time Information */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3">Expected Response Times</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                    <div>
                      <span className="font-medium text-red-800">Emergency:</span>
                      <span className="text-red-700 ml-2">Within 2 hours</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-orange-600 mr-3" />
                    <div>
                      <span className="font-medium text-orange-800">Urgent:</span>
                      <span className="text-orange-700 ml-2">Same day</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <span className="font-medium text-blue-800">High:</span>
                      <span className="text-blue-700 ml-2">Within 24 hours</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <span className="font-medium text-green-800">Medium/Low:</span>
                      <span className="text-green-700 ml-2">Within 3-5 days</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#FF5A5F] hover:bg-[#E8474B] py-4 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? 'Submitting Request...' : 'Submit Maintenance Request'}
              </Button>

              <p className="text-sm text-gray-500 text-center">
                By submitting this form, you authorize Keyskeeper to coordinate maintenance 
                on your behalf and contact you regarding this request.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Need immediate assistance?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:admin@keyskeeper.co.nz"
              className="flex items-center justify-center gap-2 text-[#FF5A5F] hover:text-[#E8474B] font-medium"
            >
              <Mail className="h-5 w-5" />
              admin@keyskeeper.co.nz
            </a>
            <a
              href="tel:+64277771486"
              className="flex items-center justify-center gap-2 text-[#FF5A5F] hover:text-[#E8474B] font-medium"
            >
              <Phone className="h-5 w-5" />
              +64 27 777 1486 (Emergency Line)
            </a>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  )
}