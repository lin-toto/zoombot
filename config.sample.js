import AutoAttendance from './plugins/auto-attendance.js'

export default [
  {
    name: 'Statistics',
    cron: '30 16 * * *',
    zoomConfig: {
      participantName: 'Zoom Student',
      email: 'me@example.com',
      meetingId: '123456789',
      meetingPassword: 'abcdef',
      duration: 90 * 60 // seconds
    },
    plugins: [
      {
        name: 'AutoAttendance',
        plugin: AutoAttendance,
        config: {
          regex: /attendance/i,
          message: 'Attendance Test'
        }
      }
    ]
  }
]
