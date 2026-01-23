# CLAUDE.md - AI Assistant Guide for a-joiner

This document provides comprehensive guidance for AI assistants working with the a-joiner codebase.

## Project Overview

**Repository**: sdark7856-lang/a-joiner
**Status**: New/Initializing
**Last Updated**: 2026-01-23

### Purpose
[To be documented: Describe the main purpose and goals of this project]

### Key Features
[To be documented: List the main features and capabilities]

## Codebase Structure

```
a-joiner/
├── [To be added as project structure develops]
└── CLAUDE.md (this file)
```

### Directory Organization

**[To be documented as directories are created]**

Common patterns to watch for:
- `/src` - Source code
- `/test` or `/tests` - Test files
- `/docs` - Documentation
- `/scripts` - Build and utility scripts
- `/config` - Configuration files
- `/lib` or `/dist` - Build output

## Technology Stack

**[To be documented]**

Common aspects to document:
- Programming language(s) and version(s)
- Framework(s) and major libraries
- Build tools and task runners
- Testing framework(s)
- Package manager
- Runtime environment

## Development Setup

### Prerequisites

**[To be documented]**

Example items:
- Required software versions
- System dependencies
- Environment variables
- API keys or credentials needed

### Installation

```bash
# [To be documented]
# Example:
# git clone <repository-url>
# cd a-joiner
# npm install  # or appropriate package manager
```

### Running the Project

```bash
# [To be documented]
# Example:
# npm start
# npm run dev
```

### Running Tests

```bash
# [To be documented]
# Example:
# npm test
# npm run test:watch
```

## Development Workflows

### Git Workflow

**Branch Naming Convention**:
- Feature branches: Use the format provided in the task context (e.g., `claude/claude-md-mkr0tgbkfyxcb1w2-BC1lL`)
- Always develop on the designated branch
- Never push to different branches without explicit permission

**Commit Messages**:
- Use clear, descriptive commit messages
- Follow conventional commits format if established
- Include session URL in commits: `https://claude.ai/code/session_<id>`

**Git Operations**:
- Always use `git push -u origin <branch-name>` for pushing
- Branch names must start with 'claude/' and end with matching session id
- Retry network failures up to 4 times with exponential backoff (2s, 4s, 8s, 16s)

### Code Review Process

[To be documented: Describe the PR review process, approval requirements, etc.]

## Coding Conventions

### Code Style

**[To be documented]**

Items to document:
- Indentation (spaces vs tabs, size)
- Line length limits
- Naming conventions (camelCase, snake_case, PascalCase)
- File naming conventions
- Import/export patterns

### Best Practices

**General Principles**:
- Avoid over-engineering - only make necessary changes
- Don't add features beyond what's requested
- Keep solutions simple and focused
- Delete unused code completely (no backwards-compatibility hacks)
- Only add error handling at system boundaries

**Security**:
- Watch for common vulnerabilities (XSS, SQL injection, command injection, etc.)
- Validate at system boundaries (user input, external APIs)
- Don't validate internal code that can be trusted
- Immediately fix any insecure code discovered

**Comments and Documentation**:
- Only add comments where logic isn't self-evident
- Don't add docstrings to unchanged code
- Update documentation when making significant changes

### Testing Conventions

**[To be documented]**

Items to document:
- Test file naming and location
- Testing framework usage
- Mock/stub patterns
- Coverage requirements
- Integration vs unit test guidelines

## Architecture Patterns

### Design Principles

**[To be documented]**

Items to document:
- Architectural patterns (MVC, microservices, etc.)
- State management approach
- Data flow patterns
- Error handling strategy
- Logging conventions

### Key Components

**[To be documented: List and describe major components/modules]**

### Data Models

**[To be documented: Describe key data structures and models]**

## API Documentation

### Internal APIs

**[To be documented]**

### External APIs

**[To be documented: Document external APIs consumed by this project]**

## Configuration

### Environment Variables

**[To be documented]**

Example format:
```bash
# DATABASE_URL=postgresql://localhost:5432/dbname
# API_KEY=your_api_key_here
# NODE_ENV=development|production|test
```

### Configuration Files

**[To be documented: List important config files and their purposes]**

## Dependencies

### Production Dependencies

**[To be documented: List key production dependencies and their purposes]**

### Development Dependencies

**[To be documented: List key development dependencies and their purposes]**

## Common Tasks

### Adding a New Feature

1. [To be documented: Step-by-step process]

### Fixing a Bug

1. [To be documented: Step-by-step process]

### Updating Dependencies

1. [To be documented: Step-by-step process]

### Deploying Changes

1. [To be documented: Deployment process]

## Troubleshooting

### Common Issues

**[To be documented as issues are encountered]**

### Debug Tools

**[To be documented: List debugging tools and techniques]**

## AI Assistant Guidelines

### Before Making Changes

1. **Always read files first** - Never propose changes to code you haven't read
2. **Use TodoWrite for complex tasks** - Plan multi-step tasks with the TodoWrite tool
3. **Understand existing patterns** - Study how similar features are implemented

### When Writing Code

1. **Security first** - Check for vulnerabilities (command injection, XSS, SQL injection, etc.)
2. **Minimal changes** - Only make requested or clearly necessary changes
3. **Avoid over-engineering**:
   - No unnecessary features or refactoring
   - No premature abstractions
   - No hypothetical future requirements
   - No defensive programming for impossible scenarios
4. **Clean deletions** - Remove unused code completely, no compatibility hacks

### Tool Usage

1. **Prefer specialized tools**:
   - Use Read instead of `cat`
   - Use Edit instead of `sed/awk`
   - Use Write instead of `echo >/cat <<EOF`
   - Use Grep instead of `grep/rg` bash commands
   - Use Glob instead of `find/ls`

2. **Use Task tool for exploration** - When gathering context or answering structural questions

3. **Parallel execution** - Run independent operations in parallel when possible

### Communication

1. **No emojis** - Unless explicitly requested by the user
2. **Concise responses** - Keep answers short and to the point
3. **Code references** - Use `file_path:line_number` format when referencing code
4. **No time estimates** - Never predict how long tasks will take

### Git Operations

1. **Read first, commit second** - Always review changes before committing
2. **Stage specific files** - Prefer adding files by name vs `git add -A`
3. **Follow commit conventions** - Match the repository's commit message style
4. **Never skip hooks** - Unless explicitly requested
5. **Never force push to main/master** - Warn if requested
6. **Create new commits** - Don't amend unless explicitly requested

## Resources

### Documentation Links

**[To be documented: Links to relevant documentation]**

### Related Projects

**[To be documented: Related repositories or projects]**

### Team Contacts

**[To be documented: Key contacts or team structure]**

## Change Log

### 2026-01-23
- Initial CLAUDE.md created
- Repository initialized

---

**Note**: This document should be updated as the project evolves. When making significant changes to architecture, conventions, or workflows, update this file accordingly to keep AI assistants informed.
