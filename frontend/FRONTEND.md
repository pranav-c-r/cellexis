# Cellexis Frontend Documentation

## Tech Stack Overview

### Core Technologies
- **React 18**: Main UI framework
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Modern build tool and development server
- **pnpm**: Package manager

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI component library
- **class-variance-authority**: Component variant management
- **tailwind-merge**: Tailwind class merging
- **tailwindcss-animate**: Animation utilities

### 3D Graphics
- **Three.js**: 3D graphics library
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Three.js helpers and abstractions

### State Management and Data Fetching
- **@tanstack/react-query**: Server state management
- **React Hook Form**: Form state management
- **Zod**: Schema validation

### Routing
- **React Router DOM**: Client-side routing

### UI/UX Enhancements
- **Framer Motion**: Animations and transitions
- **Sonner**: Toast notifications
- **date-fns**: Date utilities
- **react-day-picker**: Date picking
- **embla-carousel-react**: Carousel components
- **lucide-react**: Icon library
- **next-themes**: Theme management

### Backend Integration
- **Express**: Server framework
- **serverless-http**: Serverless deployment
- **cors**: CORS handling

### Development Tools
- **Vitest**: Unit testing
- **Prettier**: Code formatting
- **SWC**: JavaScript/TypeScript compiler

## Project Structure

```
frontend/
├── client/              # Client-side application code
│   ├── components/      # Reusable UI components
│   │   ├── layout/     # Layout components
│   │   ├── model/      # 3D model components
│   │   └── ui/         # UI components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   └── pages/          # Page components
├── public/             # Static assets
├── server/             # Server-side code
└── shared/             # Shared code between client and server
```

## Key Features
- Modern React development with TypeScript
- Component-driven architecture
- 3D visualization capabilities
- Responsive and accessible UI components
- Server-side integration
- Dark/Light theme support
- Form handling and validation
- Animation and transition effects
- Serverless deployment ready

## Development

### Setup
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

### Best Practices
1. Use TypeScript for all new code
2. Follow component-driven development
3. Ensure accessibility standards
4. Write tests for critical functionality
5. Use Tailwind CSS for styling
6. Implement responsive design
7. Optimize 3D performance

### Performance Considerations
- Lazy load components when possible
- Optimize 3D models and textures
- Implement proper code splitting
- Use proper caching strategies with React Query
- Optimize bundle size

## Deployment
The application is configured for deployment on Netlify with serverless functions support.

## Contributing
1. Follow TypeScript best practices
2. Ensure proper type definitions
3. Write documentation for new components
4. Follow the established project structure
5. Test your changes thoroughly

## Resources
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)
- [Radix UI Documentation](https://www.radix-ui.com/docs)