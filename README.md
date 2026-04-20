# Youth Opportunities Website

A clean and modern Jekyll website for university students and graduates to discover internships, scholarships, and career opportunities.

## Features

- 🏠 **Homepage** - Welcoming landing page with feature highlights
- 🎯 **Opportunities Page** - Browse and discover various opportunities
- 📱 **Responsive Design** - Works great on mobile, tablet, and desktop
- ⚡ **Fast & Lightweight** - Built with Jekyll for optimal performance
- 🎨 **Modern Styling** - Clean, professional design with smooth interactions

## Pages

1. **Home** (`/`) - Main landing page with introduction and feature cards
2. **Opportunities** (`/opportunities/`) - Explore featured internships, scholarships, and jobs

## Getting Started

### Prerequisites
- Ruby (version 2.5 or higher)
- Bundler

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd youthopp.github.io-1
```

2. Install dependencies:
```bash
bundle install
```

3. Run the development server:
```bash
bundle exec jekyll serve
```

4. Open your browser and navigate to `http://localhost:4000`

## Project Structure

```
├── _layouts/
│   └── default.html       # Main layout template
├── assets/
│   └── css/
│       └── style.css      # Custom styling
├── _config.yml            # Jekyll configuration
├── index.md              # Home page
├── opportunities.md      # Opportunities page
├── Gemfile               # Ruby dependencies
└── README.md             # This file
```

## Customization

### Update Site Information
Edit `_config.yml` to update:
- Site title
- Description
- Base URL
- Site URL

### Add More Opportunities
Edit `opportunities.md` to add, remove, or modify opportunities. Each opportunity uses a consistent card format.

### Modify Styling
Update `assets/css/style.css` to change colors, fonts, spacing, and layout.

## Color Scheme

- Primary: `#007bff` (Blue)
- Secondary: `#6c757d` (Gray)
- Success: `#28a745` (Green)
- Light Background: `#f8f9fa`

## Deployment

### GitHub Pages

1. Push your code to GitHub
2. Enable GitHub Pages in repository settings
3. Your site will be live at `https://<username>.github.io/`

## License

This project is open source and available under the MIT License.