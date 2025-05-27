# 🤝 Contributing to Brandy Shop

Thank you for your interest in contributing to Brandy Shop! We welcome contributions from developers, designers, artists, and community members who share our vision of empowering Kenyan creativity through technology.

## 🌟 Ways to Contribute

### 🐛 Bug Reports
Help us improve by reporting bugs you encounter:
- Use the [GitHub Issues](https://github.com/SK3CHI3/brandy-shop/issues) page
- Search existing issues before creating a new one
- Provide detailed reproduction steps
- Include screenshots or screen recordings when helpful
- Specify your browser, OS, and device information

### ✨ Feature Requests
Suggest new features or improvements:
- Open a [GitHub Discussion](https://github.com/SK3CHI3/brandy-shop/discussions) first
- Explain the problem your feature would solve
- Describe your proposed solution
- Consider the impact on different user types (artists, customers, admins)

### 💻 Code Contributions
Contribute to the codebase:
- Fix bugs and improve performance
- Implement new features
- Improve documentation
- Add tests and improve test coverage
- Enhance accessibility and user experience

### 🎨 Design Contributions
Help improve the user experience:
- UI/UX design improvements
- Icon and graphic design
- User flow optimization
- Mobile responsiveness enhancements
- Accessibility improvements

### 📝 Documentation
Help others understand and use Brandy Shop:
- Improve existing documentation
- Write tutorials and guides
- Create video content
- Translate content to other languages
- Update API documentation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git for version control
- A GitHub account
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Development Setup
1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/brandy-shop.git
   cd brandy-shop
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```
5. **Start the development server**:
   ```bash
   npm run dev
   ```

### Making Changes
1. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Commit your changes** with a clear message:
   ```bash
   git commit -m "feat: add new artist dashboard feature"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request** on GitHub

## 📋 Coding Standards

### Code Style
- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Use **functional components** with hooks
- Implement **proper error handling**
- Write **meaningful variable and function names**

### Component Guidelines
- Use **Shadcn/ui components** when possible
- Create **reusable components** for common UI patterns
- Implement **proper TypeScript interfaces**
- Add **JSDoc comments** for complex functions
- Follow **React best practices** and hooks rules

### File Organization
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Shadcn/ui)
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── types/              # TypeScript type definitions
└── styles/             # Global styles and Tailwind config
```

### Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase starting with "use" (`useUserData.ts`)
- **Utilities**: camelCase (`formatCurrency.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Types**: PascalCase (`UserProfile.ts`)

## 🧪 Testing Guidelines

### Writing Tests
- Write **unit tests** for utility functions
- Create **component tests** for UI components
- Add **integration tests** for complex features
- Use **React Testing Library** for component testing
- Mock external dependencies appropriately

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Test Requirements
- All new features must include tests
- Bug fixes should include regression tests
- Maintain or improve test coverage
- Tests should be readable and maintainable

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples
```bash
feat(auth): add artist registration flow
fix(cart): resolve quantity update bug
docs(api): update payment endpoints documentation
style(components): improve button component styling
refactor(hooks): optimize data fetching logic
test(auth): add login component tests
chore(deps): update dependencies to latest versions
```

## 🔍 Pull Request Process

### Before Submitting
- [ ] Code follows our style guidelines
- [ ] Tests pass locally
- [ ] Documentation is updated if needed
- [ ] Changes are tested on different screen sizes
- [ ] No console errors or warnings
- [ ] Accessibility guidelines are followed

### PR Description Template
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Other (please describe)

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] Cross-browser testing done

## Screenshots (if applicable)
Add screenshots or GIFs showing the changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process
1. **Automated checks** must pass (linting, tests, build)
2. **Code review** by at least one maintainer
3. **Testing** on different devices and browsers
4. **Approval** from project maintainers
5. **Merge** into main branch

## 🌍 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different perspectives and experiences
- Report inappropriate behavior to maintainers

### Communication
- Use clear, professional language
- Be patient with questions and feedback
- Provide helpful, actionable suggestions
- Celebrate others' contributions
- Ask for help when needed

### Cultural Sensitivity
- Respect Kenyan culture and traditions
- Research cultural significance before using traditional patterns
- Be mindful of cultural appropriation
- Collaborate with cultural experts when needed
- Promote authentic representation

## 🏆 Recognition

### Contributor Levels
- **First-time Contributors**: Welcome package and mentorship
- **Regular Contributors**: Recognition in release notes
- **Core Contributors**: Invitation to maintainer team
- **Maintainers**: Full repository access and decision-making

### Ways We Recognize Contributors
- GitHub contributor badges
- Mention in release notes
- Social media shoutouts
- Invitation to exclusive events
- Potential job opportunities

## 📞 Getting Help

### Where to Ask Questions
- **GitHub Discussions**: General questions and ideas
- **Discord Community**: Real-time chat and support
- **Email**: contribute@brandyshop.ke for private matters
- **Documentation**: Check existing docs first

### Mentorship Program
New contributors can request mentorship:
- Pair programming sessions
- Code review guidance
- Career development advice
- Technical skill building

## 🚀 Development Resources

### Useful Links
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)

### Design Resources
- [Figma Design System](link-to-figma)
- [Brand Guidelines](docs/BRAND_GUIDELINES.md)
- [Color Palette](docs/DESIGN_SYSTEM.md)
- [Typography Guide](docs/TYPOGRAPHY.md)

### Learning Materials
- [React Best Practices](https://react.dev/learn)
- [TypeScript for React](https://react-typescript-cheatsheet.netlify.app/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Performance Optimization](https://web.dev/performance/)

## 📄 License

By contributing to Brandy Shop, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

---

**Thank you for contributing to Brandy Shop!** Your efforts help us build a platform that empowers Kenyan artists and celebrates African creativity. Together, we're creating something amazing! 🎨🇰🇪
