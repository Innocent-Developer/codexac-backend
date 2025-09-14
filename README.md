# Crypto Mining Backend Application

## 🚀 Project Overview
A robust cryptocurrency mining and transaction management system built with TypeScript and Node.js.

## 📁 Directory Structure
```
backend/
├── src/
│   ├── account/
│   │   ├── login.ts         # User authentication
│   │   ├── passwordReset.ts # Password recovery
│   │   └── signup.ts        # User registration
│   ├── coinTransfer/
│   │   └── sendCoin.ts      # Coin transfer logic
│   ├── db/
│   │   └── dbconnect.ts     # MongoDB connection
│   ├── leaderboard/
│   │   └── leaderboard.ts   # Mining rankings
│   ├── mining-coin/
│   │   └── coinMine.ts      # Mining operations
│   ├── models/
│   │   ├── transaction.hash.ts  # Transaction schema
│   │   └── user.model.ts        # User schema
│   ├── routers/
│   │   └── router.ts        # API routes
│   ├── transactions/
│   │   ├── getAlltransaction.ts
│   │   ├── getAllTransactionByUser.ts
│   │   └── getTransaction.ts
│   └── index.ts             # Application entry
```

## ⚙️ Technologies Used
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Security**: bcryptjs
- **Development**: nodemon

## 🛠️ Setup & Installation

### Prerequisites
- Node.js v14 or higher
- MongoDB instance
- npm/yarn package manager

### Installation Steps
```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Build project
npm run build
```

### Environment Configuration
Create `.env` file:
```env
PORT=4000
MONGO_URI=mongodb://your-connection-string
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FixMiniingRate=10
NODE_ENV=development
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## 📌 API Endpoints

### Authentication
- **POST** `/api/signup`
  - Register new user
  - Required: username, email, password

- **POST** `/api/login`
  - User authentication
  - Required: email, password

- **POST** `/api/password-reset`
  - Password recovery
  - Required: email

### Mining Operations
- **POST** `/api/mine`
  - Mine new coins
  - Requires authentication
  - 24-hour cooldown

### Transactions
- **POST** `/api/send`
  - Transfer coins
  - Required: recipient, amount

- **GET** `/api/transactions`
  - List all transactions

- **GET** `/api/transactions/:hash`
  - Get transaction details

- **GET** `/api/transactions/user/:address`
  - Get user transactions

### Analytics
- **GET** `/api/leaderboard`
  - View top miners

## 🔒 Security Features
1. Password Encryption
2. JWT Authentication
3. Rate Limiting
4. Protected Routes
5. Transaction Verification

## 💻 Development Features
- TypeScript for type safety
- Hot reloading with nodemon
- ESLint configuration
- Error handling middleware
- MongoDB connection pooling

## 🔍 Testing
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📊 Mining System
- Daily mining reward: 10 coins
- Cooldown period: 24 hours
- Automated distribution
- Transaction limits: 5 per day

## 🔄 Transaction System
- Unique hash generation
- Block number assignment
- Transaction history
- Daily limits
- P2P transfers

## 📈 Monitoring
- Transaction logging
- Error tracking
- User activity monitoring
- System performance metrics

## 🤝 Contributing
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📝 License
MIT License

## 🆘 Support
For support, email [thecodexaoffical@gmail.com]