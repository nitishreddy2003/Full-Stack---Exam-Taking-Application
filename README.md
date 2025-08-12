# Full-Stack---Exam-Taking-Application
 ExamPro - Full-Stack Exam Taking Application

A comprehensive exam-taking platform built with React.js, Supabase, and TypeScript. This application provides a complete solution for online examinations with secure authentication, timed assessments, and detailed result analysis.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure JWT-based registration and login system
- **Exam Management**: Browse and start available exams
- **Question Display**: Interactive multiple-choice questions with navigation
- **Timer System**: 30-minute countdown with auto-submit functionality  
- **Score Calculation**: Real-time scoring with detailed results
- **Result Analysis**: Comprehensive breakdown of performance per question

### Technical Highlights
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Live timer and progress tracking
- **Data Security**: Row Level Security (RLS) with Supabase
- **Modern UI**: Clean, professional interface with smooth animations
- **Type Safety**: Full TypeScript implementation

## 🛠️ Technology Stack

- **Frontend**: React.js 18 + TypeScript
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth with JWT
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router Dom

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Supabase account

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd exam-taking-app
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
1. Create a new Supabase project
2. Click "Connect to Supabase" button in the application
3. The database schema will be automatically created with:
   - Sample exams (JavaScript, React, Web Development)
   - Question bank with 20+ MCQs
   - User session tracking
   - Results storage

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main application layout
│   └── ProtectedRoute.tsx # Authentication guard
├── contexts/           # React context providers
│   └── AuthContext.tsx # Authentication state management
├── lib/               # Utility libraries
│   └── supabase.ts    # Supabase client configuration
├── pages/             # Main application pages
│   ├── Auth.tsx       # Login/Registration
│   ├── Dashboard.tsx  # Exam selection
│   ├── Exam.tsx       # Exam taking interface
│   └── Result.tsx     # Results display
├── types/             # TypeScript type definitions
│   └── index.ts       # Shared interfaces
└── App.tsx            # Main application component
```

## 🗄️ Database Schema

### Tables
- **exams**: Exam configurations and metadata
- **questions**: Question bank with MCQ options
- **exam_sessions**: User exam attempts and progress
- **exam_results**: Final scores and performance data

### Security
- Row Level Security (RLS) enabled on all tables
- Users can only access their own sessions and results
- Public access to exam and question data for authenticated users

## 🧪 API Testing

### Using the Application
1. **Register**: Create a new account with email/password
2. **Login**: Access your dashboard
3. **Start Exam**: Choose from available exams
4. **Take Exam**: Answer questions with 30-minute timer
5. **Submit**: Review results and retake if needed

### Sample Test Data
The application includes 3 sample exams:
- **JavaScript Fundamentals** (10 questions, 30 minutes)
- **React.js Essentials** (15 questions, 45 minutes)  
- **Web Development Basics** (8 questions, 25 minutes)

## 🔧 Key Features Implementation

### Authentication Flow
- JWT-based authentication with Supabase Auth
- Automatic session management and route protection
- User registration with email confirmation disabled for testing

### Exam Session Management
- Randomized question selection from question bank
- Real-time answer tracking with local state
- Automatic session resumption on page refresh
- Timer persistence across browser sessions

### Scoring System
- Real-time score calculation based on correct answers
- Detailed performance breakdown per question
- Pass/fail determination based on exam requirements
- Time tracking with minute-level precision

### User Experience
- Smooth transitions and loading states
- Responsive design for all screen sizes
- Toast notifications for user feedback
- Progress indicators and question navigation

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

## 🤝 Contributing

This project was built as a technical assessment demonstrating full-stack development skills including:

- Modern React patterns and hooks
- TypeScript implementation
- Database design and management
- Authentication and security
- Responsive UI/UX design
- State management
- API integration

## 📝 License

This project is created for educational and assessment purposes.

---

**Built with ❤️ using React, TypeScript, and Supabase**
