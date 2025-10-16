# HexaPink - Lead Generation Platform

A modern Next.js application for lead generation and data management, built with TypeScript, MongoDB, and Stripe integration.

## 🚀 Features

- **User Management**: Complete authentication system with JWT
- **Lead Generation**: Advanced filtering and data collection
- **Payment Processing**: Stripe integration for secure transactions
- **File Management**: CSV upload and processing capabilities
- **Admin Dashboard**: Comprehensive admin panel for data management
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Lucide React Icons
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: JWT with refresh tokens
- **Payments**: Stripe
- **Email**: Nodemailer with SMTP
- **State Management**: Zustand
- **File Processing**: CSV parsing and manipulation

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Stripe account
- SMTP email service

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/hexapink-next.git
cd hexapink-next
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup

#### Development
```bash
cp .env.example .env.local
```

#### Production
```bash
cp .env.production.example .env.production
# Fill in your actual production values
```

Configure your environment variables in `.env.local`:
- MongoDB connection string
- JWT secrets
- Stripe keys
- SMTP configuration

### 4. Run development server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
hexapink-next/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── user/              # User pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── admin/             # Admin components
│   ├── auth/              # Authentication components
│   ├── common/            # Shared components
│   ├── home/              # Homepage components
│   └── user/              # User components
├── lib/                   # Utility libraries
│   ├── actions/           # Server actions
│   ├── models/            # MongoDB models
│   ├── utils/             # Helper functions
│   └── middleware/        # Custom middleware
├── types/                 # TypeScript definitions
└── public/                # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

## 📚 Documentation

- [Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [Socket.IO Migration](./SOCKET_IO_MIGRATION.md)
- [Environment Variables](./.env.example)

## 🔒 Environment Variables

Required environment variables:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/hexapink
DATABASE_URL=mongodb://localhost:27017/hexapink

# JWT
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# App URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/hexapink-next/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎯 Roadmap

- [ ] Real-time notifications (Socket.IO alternative)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] API rate limiting
- [ ] Automated testing suite
- [ ] Performance optimizations

---

**Built with ❤️ using Next.js and TypeScript**