module.exports = {
  content: ['./views/**/*.ejs'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],

  daisyui: {
    themes: [
      {
        mytheme: {
         "primary": "#00D1B2",
         "primary-content": "#ffffff",
         "secondary": "#3273DC",
         "secondary-content": "#ffffff",
         "accent": "#F6F9C8",
         "neutral": "#F5F5F5",
         "base-100": "#FFFFFF",
         "info": "#209CEE",
         "info-content": "#ffffff",
         "success": "#23D160",
         "success-content": "#ffffff",
         "warning": "#FFDD57",
         "error": "#FF3860",
         "error-content": "#ffffff",
        },
      },
    ]
  }
}
/*


         "primary-light": "#FCFCFC",
         "primary-light-content": "#00D1B2",
         "secondary-light": "#3273DC",
         "secondary-light-content": "#EEF3FC",
         "info-light": "#EEF6FC",
         "info-light-content": "#209CEE",
         "success-light": "#EFFAF3",
         "success-light-content": "#23D160",
         "warning-light": "#FFFBEB",
         "warning-light-content": "#FFDD57",
         "error-light": "#FEECF0",
         "error-light-content": "#FF3860",

*/