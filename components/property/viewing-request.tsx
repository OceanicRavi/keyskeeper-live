// components/property/viewing-request.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  User, 
  Mail, 
  Phone,
  MessageSquare
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ViewingRequestProps {
  propertyId: string
  propertyTitle: string
  propertyAddress: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface ViewingFormData {
  viewerName: string
  viewerEmail: string
  viewerPhone: string
  preferredDate: string
  preferredTime: string
  alternativeDate: string
  alternativeTime: string
  message: string
  numberOfViewers: number
}

export default function ViewingRequest({
  propertyId,
  propertyTitle,
  propertyAddress,
  onSuccess,
  onCancel
}: ViewingRequestProps) {
  const [formData, setFormData] = useState<ViewingFormData>({
    viewerName: '',
    viewerEmail: '',
    viewerPhone: '',
    preferredDate: '',
    preferredTime: '',
    alternativeDate: '',
    alternativeTime: '',
    message: '',
    numberOfViewers: 1
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 1 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Submitting viewing request...', { propertyId, formData })

      // Create viewing request in database
      const { data: insertData, error: dbError } = await supabase
        .from('viewing_requests')
        .insert([{
          property_id: propertyId,
          viewer_name: formData.viewerName,
          viewer_email: formData.viewerEmail,
          viewer_phone: formData.viewerPhone,
          preferred_date: formData.preferredDate,
          preferred_time: formData.preferredTime,
          alternative_date: formData.alternativeDate || null,
          alternative_time: formData.alternativeTime || null,
          message: formData.message || null,
          number_of_viewers: formData.numberOfViewers,
          status: 'pending'
        }])
        .select()

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error(`Database error: ${dbError.message}`)
      }

      console.log('Database insert successful:', insertData)

      // Try to send email notification (don't let this fail the whole process)
      try {
        const emailResponse = await fetch('/api/send-viewing-request-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            propertyTitle,
            propertyAddress
          }),
        })

        if (!emailResponse.ok) {
          console.warn('Email notification failed:', await emailResponse.text())
        } else {
          console.log('Email notification sent successfully')
        }
      } catch (emailError) {
        console.warn('Email notification failed:', emailError)
        // Don't fail the whole process if email fails
      }

      setSuccess(true)
      console.log('Viewing request submitted successfully')
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000) // Small delay to show success message
      }

    } catch (error: any) {
      console.error('Viewing request submission error:', error)
      setError(error.message || 'Failed to submit viewing request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Viewing Request Sent!
          </h3>
          <p className="text-gray-600 mb-6">
            Your viewing request has been sent to the landlord. You'll receive a confirmation email shortly.
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => setSuccess(false)}
              className="bg-[#504746] hover:bg-[#06b6d4]"
            >
              Request Another Viewing
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Close
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Calendar className="h-6 w-6 mr-3 text-[#504746]" />
          Request Property Viewing
        </CardTitle>
        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-gray-900">{propertyTitle}</h4>
          <p className="text-gray-600 text-sm">{propertyAddress}</p>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="viewerName">Full Name *</Label>
                <Input
                  id="viewerName"
                  name="viewerName"
                  value={formData.viewerName}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                  placeholder="John Smith"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="viewerEmail">Email Address *</Label>
                <Input
                  id="viewerEmail"
                  name="viewerEmail"
                  type="email"
                  value={formData.viewerEmail}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                  placeholder="john@example.com"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="viewerPhone">Phone Number *</Label>
                <Input
                  id="viewerPhone"
                  name="viewerPhone"
                  type="tel"
                  value={formData.viewerPhone}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                  placeholder="+64 27 123 4567"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="numberOfViewers">Number of Viewers</Label>
                <Input
                  id="numberOfViewers"
                  name="numberOfViewers"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.numberOfViewers}
                  onChange={handleInputChange}
                  className="mt-1"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Preferred Viewing Time */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Viewing Times</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preferredDate">Preferred Date *</Label>
                <Input
                  id="preferredDate"
                  name="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                  min={new Date().toISOString().split('T')[0]}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="preferredTime">Preferred Time *</Label>
                <select
                  id="preferredTime"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#504746] focus:border-[#504746] disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                </select>
              </div>
              <div>
                <Label htmlFor="alternativeDate">Alternative Date (Optional)</Label>
                <Input
                  id="alternativeDate"
                  name="alternativeDate"
                  type="date"
                  value={formData.alternativeDate}
                  onChange={handleInputChange}
                  className="mt-1"
                  min={new Date().toISOString().split('T')[0]}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="alternativeTime">Alternative Time (Optional)</Label>
                <select
                  id="alternativeTime"
                  name="alternativeTime"
                  value={formData.alternativeTime}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#504746] focus:border-[#504746] disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <Label htmlFor="message">Message to Landlord (Optional)</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Any questions or additional information..."
              rows={4}
              className="mt-1"
              disabled={loading}
            />
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Viewing Guidelines</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Please arrive on time for your scheduled viewing</p>
              <p>• Bring valid ID and proof of income if available</p>
              <p>• Feel free to ask questions about the property</p>
              <p>• The landlord will contact you within 24 hours</p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1 bg-[#504746] hover:bg-[#06b6d4] disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Request Viewing'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}