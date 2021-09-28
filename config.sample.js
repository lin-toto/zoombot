import AutoAttendance from './plugins/auto-attendance.js'

export default [
  {
    name: "Statistics",
    zoomConfig: {
      name: 'Zoom Student',
      email: 'me@example.com',
      meetingId: '123456789',
      meetingPassword: 'abcdef'
    },
    plugins: [
      {
        name: 'AutoAttendance',
        plugin: AutoAttendance,
        config: {
          regex: /attendance/i,
          message: "Attendance Test"
        }
      }
    ]
  }
]
