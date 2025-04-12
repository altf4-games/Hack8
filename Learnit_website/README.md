# Learnit Platform

A comprehensive learning platform for teachers and students to create quizzes, track progress, and enhance learning outcomes.

## Features

- PDF quiz generator
- Interactive learning tools
- Teacher admin dashboard
- Student progress tracking
- Customizable quiz creation

## Setup

### Prerequisites

- Node.js 16+ and npm
- Firebase account
- Firebase CLI

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Learnit_website
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase
```bash
# Install Firebase tools if you don't have them
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in the project
firebase init
```

4. Set up environment variables
Create a `.env.local` file in the project root with the following variables:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

5. Set up Firestore security rules
```bash
firebase deploy --only firestore:rules
```

6. Initialize the first teacher admin account
```bash
# Download your Firebase service account key and save it as firebase-service-account.json in the project root
# Then run:
node src/scripts/initializeTeacher.js admin@example.com
```

7. Run the development server
```bash
npm run dev
```

## Teacher Admin Setup

### Setting up a new teacher

1. Login to the admin dashboard at `/admin/login` with the admin account created during setup.
2. Navigate to Settings > Teachers.
3. Click "Add Teacher" and enter their email address.
4. The teacher will receive an invitation email to set their password.

### Admin dashboard features

- **Dashboard**: Overview of student activity, quiz performance, and key metrics.
- **Students**: View and manage student accounts, track progress, and organize into groups.
- **Quizzes**: Create, manage, and assign quizzes to individual students or groups.
- **Messages**: Send communications to students or other teachers.
- **Learning**: Access and organize learning materials and resources.
- **Settings**: Manage account settings, teacher privileges, and system configurations.

## Student Access

Students can sign up at `/signup` or be invited by teachers. Once registered, they can:

1. Take assigned quizzes
2. Track their progress
3. Generate quizzes from PDF documents
4. Review past quiz results

## Troubleshooting

### Firebase Permission Issues

If you encounter the error "FirebaseError: Missing or insufficient permissions":

1. Check your Firestore security rules in `firestore.rules`
2. Ensure the user is properly authenticated
3. Verify the user has the correct role (teacher/student)
4. For teachers, ensure they have a document in the `teachers` collection with their UID

To fix permission issues for teachers:
```bash
# Run the teacher initialization script with the email of the teacher
node src/scripts/initializeTeacher.js teacher@example.com
```

## License

[MIT License](LICENSE) 