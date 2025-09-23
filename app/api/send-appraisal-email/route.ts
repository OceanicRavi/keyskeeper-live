import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const formData = await request.json()

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.propertyAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #504746; font-size: 28px; margin: 0;">New Property Appraisal Request</h1>
            <p style="color: #6b7280; margin: 10px 0 0 0;">Submitted via Keyskeeper website</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #504746; padding-bottom: 5px;">Contact Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600; width: 40%;">Name:</td>
                <td style="padding: 8px 0; color: #374151;">${formData.firstName} ${formData.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Email:</td>
                <td style="padding: 8px 0; color: #374151;">${formData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Phone:</td>
                <td style="padding: 8px 0; color: #374151;">${formData.phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Preferred Contact:</td>
                <td style="padding: 8px 0; color: #374151;">${formData.preferredContactMethod} (${formData.preferredContactTime})</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #504746; padding-bottom: 5px;">Property Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600; width: 40%;">Address:</td>
                <td style="padding: 8px 0; color: #374151;">${formData.propertyAddress}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Suburb:</td>
                <td style="padding: 8px 0; color: #374151;">${formData.suburb}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">City:</td>
                <td style="padding: 8px 0; color: #374151;">${formData.city}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Property Type:</td>
                <td style="padding: 8px 0; color: #374151; text-transform: capitalize;">${formData.propertyType}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Bedrooms:</td>
                <td style="padding: 8px 0; color: #374151;">${formData.bedrooms || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Bathrooms:</td>
                <td style="padding: 8px 0; color: #374151;">${formData.bathrooms || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Land Size:</td>
                <td style="padding: 8px 0; color: #374151;">${formData.landSize ? formData.landSize + ' sqm' : 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Year Built:</td>
                <td style="padding: 8px 0; color: #374151;">${formData.yearBuilt || 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Current Estimated Value:</td>
                <td style="padding: 8px 0; color: #374151;">${formData.currentValue || 'Not specified'}</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #504746; padding-bottom: 5px;">Appraisal Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600; width: 40%;">Reason for Appraisal:</td>
                <td style="padding: 8px 0; color: #374151; text-transform: capitalize;">${formData.reasonForAppraisal.replace('_', ' ')}</td>
              </tr>
            </table>
            ${formData.additionalInfo ? `
              <div style="margin-top: 15px;">
                <p style="color: #6b7280; font-weight: 600; margin-bottom: 8px;">Additional Information:</p>
                <p style="color: #374151; background-color: #f9fafb; padding: 15px; border-radius: 6px; line-height: 1.6;">${formData.additionalInfo}</p>
              </div>
            ` : ''}
          </div>

          <div style="background-color: #fef3f2; padding: 20px; border-radius: 6px; border-left: 4px solid #504746;">
            <p style="margin: 0; color: #374151; font-weight: 600;">⏰ Follow-up Required</p>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Please contact this client within 24 hours to schedule the property appraisal.</p>
          </div>
        </div>
      </div>
    `

    const { data, error } = await resend.emails.send({
      from: 'Keyskeeper <noreply@keyskeeper.co.nz>',
      to: ['admin@keyskeeper.co.nz'],
      subject: `New Property Appraisal Request - ${formData.propertyAddress}`,
      html: emailContent,
      replyTo: formData.email,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}