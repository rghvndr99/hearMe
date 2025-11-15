// Google Calendar API service for creating/managing Google Meet sessions
// Simplified version - Creates events on VoiceLap's calendar and invites users

import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

/**
 * Get authenticated calendar client using service account or stored credentials
 * For now, this is a placeholder - you'll need to set up service account credentials
 */
function getCalendarClient() {
  // TODO: Set up service account authentication
  // For now, we'll return a placeholder that will need proper credentials

  // Option 1: Service Account (recommended for production)
  // const auth = new google.auth.GoogleAuth({
  //   keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
  //   scopes: SCOPES,
  // });

  // Option 2: OAuth with your personal account (simpler for testing)
  // You'll need to manually get an access token and refresh token for rghvndr99@gmail.com
  // and store them in environment variables

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Set your personal account's tokens here
  // You'll need to get these once by going through OAuth flow manually
  if (process.env.GOOGLE_ADMIN_ACCESS_TOKEN && process.env.GOOGLE_ADMIN_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      access_token: process.env.GOOGLE_ADMIN_ACCESS_TOKEN,
      refresh_token: process.env.GOOGLE_ADMIN_REFRESH_TOKEN,
    });
  }

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

// Keep these for backward compatibility but they're no longer used
export function getAuthUrl(userId) {
  return '#'; // No longer needed
}

export async function getTokensFromCode(code) {
  return {}; // No longer needed
}

/**
 * Create a Google Calendar event with Google Meet
 * Simplified version - creates event on VoiceLap's calendar and invites the user
 * @param {Object} params
 * @param {Date} params.startTime - Event start time
 * @param {number} params.durationMinutes - Event duration in minutes
 * @param {string} params.summary - Event title
 * @param {string} params.description - Event description
 * @param {string} params.attendeeEmail - User's email to send invite
 * @param {string} params.attendeePhone - User's phone (optional, for description)
 * @returns {Promise<Object>} Created event with meet link
 */
export async function createCalendarEvent({ startTime, durationMinutes, summary, description, attendeeEmail, attendeePhone }) {
  const calendar = getCalendarClient();

  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  // Build description with contact info
  let fullDescription = description || 'Your scheduled session with a VoiceLap listener.';
  if (attendeePhone) {
    fullDescription += `\n\nUser Contact: ${attendeePhone}`;
  }
  fullDescription += '\n\nVoiceLap Support: +91 810-556-8665';

  const event = {
    summary: summary || 'VoiceLap - In-Person Session',
    description: fullDescription,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'Asia/Kolkata', // IST
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    conferenceData: {
      createRequest: {
        requestId: `voicelap-${Date.now()}`, // Unique ID for meet creation
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 30 }, // 30 min before
      ],
    },
  };

  // Add user as attendee if email provided
  if (attendeeEmail) {
    event.attendees = [{ email: attendeeEmail }];
  }

  const response = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_EMAIL || 'primary',
    resource: event,
    conferenceDataVersion: 1, // Required for Google Meet
    sendUpdates: 'all', // Send email notifications to attendees
  });

  return {
    eventId: response.data.id,
    meetLink: response.data.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri,
    calendarLink: response.data.htmlLink,
    event: response.data,
  };
}

/**
 * Update a Google Calendar event (reschedule)
 * Simplified version - updates event on VoiceLap's calendar
 * @param {Object} params
 * @param {string} params.eventId - Google Calendar event ID
 * @param {Date} params.newStartTime - New event start time
 * @param {number} params.durationMinutes - Event duration in minutes
 * @returns {Promise<Object>} Updated event
 */
export async function updateCalendarEvent({ eventId, newStartTime, durationMinutes }) {
  const calendar = getCalendarClient();

  const endTime = new Date(newStartTime.getTime() + durationMinutes * 60000);

  const response = await calendar.events.patch({
    calendarId: process.env.GOOGLE_CALENDAR_EMAIL || 'primary',
    eventId: eventId,
    resource: {
      start: {
        dateTime: newStartTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
    },
    sendUpdates: 'all', // Notify attendees
  });

  return response.data;
}

/**
 * Delete a Google Calendar event (cancel)
 * Simplified version - deletes event from VoiceLap's calendar
 * @param {Object} params
 * @param {string} params.eventId - Google Calendar event ID
 * @returns {Promise<void>}
 */
export async function deleteCalendarEvent({ eventId }) {
  const calendar = getCalendarClient();

  await calendar.events.delete({
    calendarId: process.env.GOOGLE_CALENDAR_EMAIL || 'primary',
    eventId: eventId,
    sendUpdates: 'all', // Notify attendees
  });
}

