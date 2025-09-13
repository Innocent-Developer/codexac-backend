# Cryptocurrency Mining Application Backend

## Overview
A secure and scalable backend system for cryptocurrency mining and trading, built with TypeScript, Node.js, Express, and MongoDB.

## 🚀 Key Features

### Mining System
- Automated daily mining rewards (10 coins/day)
- 24-hour mining cooldown
- Secure mining validation

### Transaction System
- Peer-to-peer coin transfers
- Transaction history tracking
- Daily transaction limits
- Secure hash generation
- Block number assignment

### User Management
- JWT-based authentication
- Secure password handling
- Account recovery system

### Analytics
- Real-time leaderboard
- Transaction metrics
- User statistics

## 🛠 Technical Stack

- **Backend**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Security**: bcryptjs
- **Development**: nodemon

## 📦 Installation

```bash
git clone <repository-url>
cd crypto-mining-app
npm install
```

## ⚙️ Configuration

Create `.env` file:
```env
PORT=4000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
FixMiniingRate=10
NODE_ENV=development
```

## 🚀 Running the Application

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

## 📁 Project Structure
```
backend/
├── src/
│   ├── account/          # Authentication logic
│   ├── coinTransfer/     # Coin transfer operations
│   ├── db/              # Database connection
│   ├── leaderboard/     # Leaderboard functionality
│   ├── mining-coin/     # Mining operations
│   ├── models/          # Data models
│   ├── routers/         # API routes
│   ├── transactions/    # Transaction handling
│   └── index.ts         # Entry point
```

## 🔗 API Endpoints

### Authentication
- `POST /api/signup` - New user registration
- `POST /api/login` - User authentication
- `POST /api/password-reset` - Password recovery

### Mining Operations
- `POST /api/mine` - Initiate mining

### Transactions
- `POST /api/send` - Transfer coins
- `GET /api/transactions` - List transactions
- `GET /api/transactions/:hash` - Transaction details
- `GET /api/transactions/user/:address` - User transactions

### Analytics
- `GET /api/leaderboard` - Top miners ranking

## 🔒 Security Features
- Password hashing
- JWT authentication
- Rate limiting
- Transaction verification
- Protected routes

## 📝 License
MIT License

## 🤝 Contributing
Pull requests welcome. For major changes, open an issue first.