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

    const formData = await request.formData()
    
    // Extract form fields
    const data = {
      tenantName: formData.get('tenantName') as string,
      tenantEmail: formData.get('tenantEmail') as string,
      tenantPhone: formData.get('tenantPhone') as string,
      propertyAddress: formData.get('propertyAddress') as string,
      issueTitle: formData.get('issueTitle') as string,
      issueDescription: formData.get('issueDescription') as string,
      category: formData.get('category') as string,
      priority: formData.get('priority') as string,
      isEmergency: formData.get('isEmergency') === 'true',
      preferredContactTime: formData.get('preferredContactTime') as string,
      additionalNotes: formData.get('additionalNotes') as string,
    }

    // Get uploaded images (for now, we'll just note them in the email)
    const imageFiles = []
    for (let i = 0; i < 5; i++) {
      const file = formData.get(`image_${i}`) as File
      if (file) {
        imageFiles.push(file.name)
      }
    }

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'urgent': return '#dc2626'
        case 'high': return '#ea580c'
        case 'medium': return '#ca8a04'
        case 'low': return '#16a34a'
        default: return '#6b7280'
      }
    }

    const getPriorityLabel = (priority: string) => {
      switch (priority) {
        case 'urgent': return 'URGENT - Same Day'
        case 'high': return 'HIGH - Within 24 Hours'
        case 'medium': return 'MEDIUM - Within Few Days'
        case 'low': return 'LOW - Can Wait a Week'
        default: return priority
      }
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #504746; font-size: 28px; margin: 0;">New Maintenance Request</h1>
            <p style="color: #6b7280; margin: 10px 0 0 0;">Submitted via Keyskeeper website</p>
            ${data.isEmergency ? `
              <div style="background-color: #fef2f2; border: 2px solid #dc2626; border-radius: 6px; padding: 15px; margin-top: 15px;">
                <p style="color: #dc2626; font-weight: bold; margin: 0; font-size: 16px;">🚨 EMERGENCY REQUEST 🚨</p>
                <p style="color: #7f1d1d; margin: 5px 0 0 0; font-size: 14px;">Immediate attention required</p>
              </div>
            ` : ''}
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #504746; padding-bottom: 5px;">Issue Summary</h2>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin-bottom: 15px;">
              <h3 style="color: #374151; font-size: 18px; margin: 0 0 10px 0;">${data.issueTitle}</h3>
              <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <span style="background-color: ${getPriorityColor(data.priority)}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                  ${getPriorityLabel(data.priority)}
                </span>
                <span style="background-color: #e5e7eb; color: #374151; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: capitalize;">
                  ${data.category.replace('_', ' ')}
                </span>
              </div>
              <p style="color: #374151; line-height: 1.6; margin: 0;">${data.issueDescription}</p>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #504746; padding-bottom: 5px;">Tenant Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600; width: 40%;">Name:</td>
                <td style="padding: 8px 0; color: #374151;">${data.tenantName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Email:</td>
                <td style="padding: 8px 0; color: #374151;">${data.tenantEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Phone:</td>
                <td style="padding: 8px 0; color: #374151;">${data.tenantPhone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Property:</td>
                <td style="padding: 8px 0; color: #374151;">${data.propertyAddress}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Best Contact Time:</td>
                <td style="padding: 8px 0; color: #374151; text-transform: capitalize;">${data.preferredContactTime}</td>
              </tr>
            </table>
          </div>

          ${data.additionalNotes ? `
            <div style="margin-bottom: 25px;">
              <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #504746; padding-bottom: 5px;">Additional Notes</h2>
              <p style="color: #374151; background-color: #f9fafb; padding: 15px; border-radius: 6px; line-height: 1.6; margin: 0;">${data.additionalNotes}</p>
            </div>
          ` : ''}

          ${imageFiles.length > 0 ? `
            <div style="margin-bottom: 25px;">
              <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #504746; padding-bottom: 5px;">Attached Images</h2>
              <p style="color: #6b7280; margin: 0;">${imageFiles.length} image(s) uploaded: ${imageFiles.join(', ')}</p>
              <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0 0;">Note: Image attachments are not yet implemented in the email system.</p>
            </div>
          ` : ''}

          <div style="background-color: ${data.isEmergency ? '#fef2f2' : data.priority === 'urgent' ? '#fff7ed' : '#f0f9ff'}; padding: 20px; border-radius: 6px; border-left: 4px solid ${data.isEmergency ? '#dc2626' : getPriorityColor(data.priority)};">
            <p style="margin: 0; color: #374151; font-weight: 600;">
              ${data.isEmergency ? '🚨 Emergency Response Required' : '⏰ Response Time Required'}
            </p>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
              ${data.isEmergency 
                ? 'This is an emergency request requiring immediate attention within 2 hours.' 
                : `Please respond according to ${getPriorityLabel(data.priority)} guidelines.`}
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This email was automatically generated from the Keyskeeper maintenance request system.
            </p>
          </div>
        </div>
      </div>
    `

    const { data: emailData, error } = await resend.emails.send({
      from: 'Keyskeeper Maintenance <noreply@keyskeeper.co.nz>',
      to: ['admin@keyskeeper.co.nz'],
      subject: `${data.isEmergency ? '🚨 EMERGENCY' : data.priority.toUpperCase()} Maintenance Request - ${data.issueTitle}`,
      html: emailContent,
      replyTo: data.tenantEmail,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: emailData })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}