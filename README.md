# 24julex - Premium Anti-Tarnish Jewelry E-commerce Platform

A comprehensive SaaS e-commerce platform for 24julex, a fast-fashion jewelry brand based in Salem, Tamil Nadu. This platform serves both B2C customers and B2B resellers with a hybrid architecture featuring role-based access control, dual pricing, and modern Gen-Z aesthetics.

## 🏗️ Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS 4, shadcn/ui
- **Backend**: Node.js with Express.js, TypeScript
- **Database**: SQLite with Prisma ORM (easily migratable to PostgreSQL)
- **Authentication**: JWT with Role-Based Access Control (RBAC)
- **Payment**: Razorpay Integration
- **Communication**: WhatsApp Business API Integration
- **State Management**: Zustand for client state

### Key Features
- 🎨 **Gen-Z Aesthetic**: Modern, golden-finish design with neon accents
- 🔄 **Dual Interface**: Separate experiences for B2C and B2B users
- 💰 **Dynamic Pricing**: Different pricing based on user role (customer vs reseller)
- 🛡️ **Anti-Tarnish & Waterproof**: Product attributes for jewelry specifications
- 📱 **WhatsApp Integration**: Direct ordering and customer support
- 💳 **Razorpay Payments**: Secure payment processing
- 📊 **Reseller Dashboard**: Analytics and order management for B2B users

## 📁 Project Structure

```
24julex/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── products/             # Product management
│   │   │   ├── orders/               # Order processing
│   │   │   ├── cart/                 # Shopping cart
│   │   │   ├── payments/             # Razorpay integration
│   │   │   └── placeholder/         # Image placeholder service
│   │   ├── login/                   # Login page
│   │   ├── register/                 # Registration page
│   │   ├── reseller/                 # B2B reseller portal
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Homepage
│   ├── components/                   # React components
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── Navbar.tsx               # Navigation bar
│   │   ├── ProductCard.tsx          # Product display card
│   │   ├── ProductGrid.tsx          # Product listing with filters
│   │   └── RazorpayPayment.tsx      # Payment component
│   └── lib/                         # Utility libraries
│       ├── db.ts                    # Database client
│       ├── auth.ts                  # Authentication utilities
│       ├── store.ts                 # Zustand stores
│       └── whatsapp.ts              # WhatsApp integration
├── prisma/
│   └── schema.prisma                # Database schema
├── public/                          # Static assets
└── package.json                     # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Bun package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 24julex
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key"
   RAZORPAY_KEY_ID="rzp_test_your_key_id"
   RAZORPAY_KEY_SECRET="your_razorpay_secret"
   NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_your_key_id"
   ```

4. **Initialize database**
   ```bash
   bun run db:push
   bun run db:generate
   ```

5. **Start development server**
   ```bash
   bun run dev
   ```

The application will be available at `http://localhost:3000`.

## 📊 Database Schema

### Core Models

#### Users & Authentication
- **User**: Basic user information with role (customer/reseller/admin)
- **Reseller**: Extended profile for B2B users with GST and business details

#### Products
- **Category**: Product categorization
- **Product**: Jewelry items with anti-tarnish, waterproof attributes, dual pricing

#### Orders & Transactions
- **Order**: Orders with B2C/B2B type differentiation
- **OrderItem**: Line items within orders
- **CartItem**: Shopping cart management
- **WishlistItem**: Product wishlist functionality

### Key Features
- **Role-Based Access**: Customer, Reseller, Admin roles
- **Dual Pricing**: `priceB2c` for retail, `priceB2b` for wholesale
- **Product Attributes**: `isAntiTarnish`, `isWaterproof`, `material`, `weight`
- **Order Types**: Automatic B2C/B2B classification based on user role

## 🎨 Design System

### Color Palette
- **Primary**: Golden finish (`#FACC15` to `#EAB308`)
- **Background**: Clean white (`#FFFFFF`)
- **Text**: Deep black (`#0F0F0F`)
- **Accent**: Neon pink (`#FF10F0`) for Gen-Z appeal
- **Secondary**: Holographic silver tones

### Typography
- **Display**: Poppins (headings, bold statements)
- **Body**: Inter (readable text, UI elements)

### UI Components
- **Cards**: Rounded corners, golden shadows on hover
- **Buttons**: Gradient backgrounds, bold typography
- **Badges**: Feature highlights (Anti-Tarnish, Waterproof)
- **Responsive**: Mobile-first design approach

## 🔐 Authentication & Authorization

### User Roles
1. **Customer**: Standard B2C shopping experience
2. **Reseller**: B2B wholesale access with special pricing
3. **Admin**: Full platform management (to be implemented)

### JWT Flow
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns JWT token with user role
3. Client stores token and includes in API requests
4. Middleware verifies token and extracts user context

### Protected Routes
- `/reseller` - Only accessible to verified resellers
- API endpoints require `Authorization: Bearer <token>` header

## 💳 Payment Integration

### Razorpay Setup
1. Create Razorpay account and get API keys
2. Configure environment variables
3. Payment flow:
   - Create order via `/api/payments/create-order`
   - Initialize Razorpay checkout
   - Verify payment via `/api/payments/verify`
   - Update order status in database

### Payment Features
- Secure payment processing
- Automatic order status updates
- Error handling and retry mechanisms
- Mobile-optimized checkout experience

## 📱 WhatsApp Integration

### Features
- **Product Inquiries**: Pre-filled messages for specific products
- **Order Confirmation**: Automatic order details sharing
- **Bulk Inquiries**: Reseller bulk ordering via WhatsApp
- **Customer Support**: Direct support channel

### Implementation
- WhatsApp Business API integration
- Pre-formatted message templates
- Product URL sharing
- Customer information pre-filling

## 🛒 E-commerce Features

### B2C Experience
- Standard shopping cart and checkout
- Product browsing with filters
- Wishlist functionality
- Order tracking

### B2B Reseller Portal
- Wholesale pricing display
- Bulk ordering capabilities
- Order history and analytics
- Business information management
- Credit limit logic (framework ready)

### Product Management
- Anti-tarnish and waterproof attributes
- Material and weight specifications
- Image management
- Stock tracking
- Category organization

## 📱 Responsive Design

### Mobile-First Approach
- Optimized for mobile devices (Gen-Z primary usage)
- Touch-friendly interface elements
- Progressive enhancement for desktop
- Consistent experience across devices

### Breakpoints
- Mobile: Default styles
- Tablet: `sm:` (640px+)
- Desktop: `md:` (768px+)
- Large: `lg:` (1024px+)
- Extra Large: `xl:` (1280px+)

## 🔧 Development Guidelines

### Code Quality
- TypeScript for type safety
- ESLint for code consistency
- Component-based architecture
- Proper error handling
- Loading states and user feedback

### API Standards
- RESTful design principles
- Consistent response formats
- Proper HTTP status codes
- JWT authentication
- Input validation

### State Management
- Zustand for client-side state
- Server state via API calls
- Persistent auth state
- Shopping cart persistence

## 🚀 Deployment

### Environment Setup
1. **Production Database**: Configure PostgreSQL connection
2. **Environment Variables**: Set all production secrets
3. **Build**: Run `bun run build`
4. **Start**: Run `bun run start`

### Considerations
- Database migrations for schema updates
- SSL certificates for secure payments
- CDN for static assets
- Monitoring and logging setup

## 🤝 Contributing

### Development Workflow
1. Create feature branch from main
2. Implement changes with proper testing
3. Run `bun run lint` for code quality
4. Test all user flows
5. Submit pull request with detailed description

### Code Standards
- Follow existing code patterns
- Use TypeScript strictly
- Implement proper error boundaries
- Add loading states for async operations
- Maintain responsive design principles

## 📈 Future Enhancements

### Planned Features
- [ ] Admin dashboard for platform management
- [ ] Advanced analytics and reporting
- [ ] Email marketing integration
- [ ] Social media sharing features
- [ ] Product recommendation engine
- [ ] Multi-currency support
- [ ] Advanced inventory management
- [ ] Customer reviews and ratings

### Technical Improvements
- [ ] PostgreSQL migration
- [ ] Redis caching layer
- [ ] Advanced search with Elasticsearch
- [ ] Image optimization CDN
- [ ] Progressive Web App (PWA) features

## 📞 Support

For technical support or questions:
- **WhatsApp**: +91 9876543210
- **Email**: support@24julex.com
- **Documentation**: Check inline code comments

---

**Built with ❤️ in Salem, Tamil Nadu for the modern Gen-Z jewelry enthusiast.**