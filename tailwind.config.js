/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./views/**/*.ejs", "./public/**/*.js"],
    theme: {
        extend: {
            colors: {
                facebook: '#1877F2',
                linkedin: '#0A66C2',
                twitter: '#1DA1F2',
                github: '#333333',
                discord: '#5865F2'
            }
        },
    },
    plugins: [],
}