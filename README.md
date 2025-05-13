# Science Chat AI Platform

This is a Next.js application that allows scientists to have conversations with a Gemini-powered AI chatbot. The application features a clean, Vercel-inspired design with smooth animations powered by Framer Motion.

## Setup

1. Clone this repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env.local` file in the root directory and add your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```
4. Run the development server:
```bash
npm run dev
```
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- **AI-powered conversations**: Ask scientific questions and get AI-generated responses
- **Multiple scientist personas**: Choose from various famous scientists as your chat identity
- **Chat history**: Conversations are saved in the browser's local storage
- **Smooth animations**: Powered by Framer Motion for a polished user experience
- **Typing indicators**: Visual feedback while waiting for AI responses
- **Responsive design**: Works well on desktop and mobile devices

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Google Gemini API](https://ai.google.dev/) - AI model for chat responses

## Customization

You can customize the application by:
- Adding more scientists in the `scientists` array
- Adjusting the styling in `globals.css`
- Modifying the API parameters in `api/gemini-chat/route.js`

## License

This project is MIT licensed.

## Acknowledgements

- Design inspired by Vercel's clean aesthetic
- Built for educational purposes

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
