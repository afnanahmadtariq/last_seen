# 🛰️ LastSeenPing

A modern website monitoring and uptime tracking application that helps you monitor your websites and get real-time status updates.

## 🚀 [Live Demo](https://last-seen-ping.vercel.app/)

## ✨ Features

- **Real-time Website Monitoring** - Monitor multiple websites simultaneously
- **Uptime Tracking** - Track website availability with detailed analytics
- **SSL Certificate Monitoring** - Monitor SSL certificate status and expiry
- **Response Time Analytics** - Measure and track website response times
- **User Authentication** - Secure login with NextAuth.js and MongoDB
- **Modern Dashboard** - Clean, responsive UI built with shadcn/ui
- **Data Persistence** - MongoDB integration for reliable data storage

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: NextAuth.js with MongoDB adapter
- **Database**: MongoDB
- **Deployment**: Vercel

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB database
- pnpm or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/last_seen.git
cd last_seen
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Configure your `.env.local`:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── profiles/          # Profile management
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## 🚀 Deployment

The app is optimized for deployment on Vercel:

1. Fork this repository
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

If you have any questions or need help, feel free to open an issue or reach out!
