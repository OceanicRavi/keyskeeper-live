// app/api/send-viewing-request-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const formData = await request.json()

    // Validate required fields
    if (!formData.viewerName || !formData.viewerEmail || !formData.preferredDate || !formData.preferredTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-NZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatTime = (timeString: string) => {
      const [hours, minutes] = timeString.split(':')
      const date = new Date()
      date.setHours(parseInt(hours), parseInt(minutes))
      return date.toLocaleTimeString('en-NZ', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #504746; font-size: 28px; margin: 0;">New Property Viewing Request</h1>
            <p style="color: #6b7280; margin: 10px 0 0 0;">Submitted via Keyskeeper website</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #504746; padding-bottom: 5px;">Property Details</h2>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px;">
              <h3 style="color: #374151; font-size: 18px; margin: 0 0 10px 0;">${formData.propertyTitle}</h3>
              <p style="color: #6b7280; margin: 0; display: flex; align-items: center;">
                📍 ${formData.propertyAddress}
              </p>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #504746; padding-bottom: 5px;">Viewer Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600; width: 40%;">Name:</td>
                <td style="padding: 8px 0; color: #374151;">${formData.viewerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Email:</td>
                <td style="padding: 8px 0; color: #374151;">${formData.viewerEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Phone:</td>
                <td style="padding: 8px 0; color: #374151;">${formData.viewerPhone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Number of Viewers:</td>
                <td style="padding: 8px 0; color: #374151;">${formData.numberOfViewers}</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #504746; padding-bottom: 5px;">Requested Viewing Times</h2>
            <div style="background-color: #fef3f2; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
              <p style="color: #374151; font-weight: 600; margin: 0 0 5px 0;">Preferred Time:</p>
              <p style="color: #374151; margin: 0; font-size: 16px;">
                📅 ${formatDate(formData.preferredDate)} at ${formatTime(formData.preferredTime)}
              </p>
            </div>
            
            ${formData.alternativeDate && formData.alternativeTime ? `
              <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px;">
                <p style="color: #374151; font-weight: 600; margin: 0 0 5px 0;">Alternative Time:</p>
                <p style="color: #374151; margin: 0; font-size: 16px;">
                  📅 ${formatDate(formData.alternativeDate)} at ${formatTime(formData.alternativeTime)}
                </p>
              </div>
            ` : ''}
          </div>

          ${formData.message ? `
            <div style="margin-bottom: 25px;">
              <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #504746; padding-bottom: 5px;">Message from Viewer</h2>
              <p style="color: #374151; background-color: #f9fafb; padding: 15px; border-radius: 6px; line-height: 1.6; margin: 0;">${formData.message}</p>
            </div>
          ` : ''}

          <div style="background-color: #fef3f2; padding: 20px; border-radius: 6px; border-left: 4px solid #504746;">
            <p style="margin: 0; color: #374151; font-weight: 600;">⏰ Action Required</p>
            <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">Please respond to this viewing request within 24 hours to confirm or suggest alternative times.</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              This email was automatically generated from the Keyskeeper viewing request system.
            </p>
          </div>
        </div>
      </div>
    `

    const { data, error } = await resend.emails.send({
      from: 'Keyskeeper Viewings <noreply@keyskeeper.co.nz>',
      to: ['admin@keyskeeper.co.nz'],
      subject: `New Viewing Request - ${formData.propertyTitle}`,
      html: emailContent,
      replyTo: formData.viewerEmail,
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