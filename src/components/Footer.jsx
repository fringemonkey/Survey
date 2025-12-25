import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="border-t border-notion-bg-tertiary mt-16">
      <div className="notion-content py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-notion-text-secondary">
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Link
              to="/about"
              className="hover:text-notion-accent transition-colors"
            >
              About
            </Link>
            <span className="text-notion-bg-tertiary">•</span>
            <Link
              to="/methodology"
              className="hover:text-notion-accent transition-colors"
            >
              Methodology
            </Link>
            <span className="text-notion-bg-tertiary">•</span>
            <a
              href="https://github.com/fringemonkey/Survey"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-notion-accent transition-colors"
            >
              Source Code
            </a>
          </div>
          <div className="text-xs text-notion-text-secondary/70">
            Fan community project • Not affiliated with{' '}
            <a
              href="https://www.channel37.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-notion-accent transition-colors"
            >
              Channel37
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

