import React from "react";
import { Github, Linkedin } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/Mohataseem89",
      icon: Github,
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/mohataseem-khan/",
      icon: Linkedin,
    },
  ];

  return (
    <footer className="bg-base-200 border-t border-base-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-field bg-primary flex items-center justify-center">
              <span className="text-primary-content font-semibold text-sm">E</span>
            </div>
            <span className="font-medium text-base-content">EngageDev</span>
          </div>

          <div className="flex items-center space-x-3">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-field text-base-content/50 hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label={social.name}
                >
                  <Icon size={16} />
                </a>
              );
            })}
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-base-content/40 ml-4">
              <div className="w-1.5 h-1.5 bg-base-content/30 rounded-full"></div>
              <span>Project in development</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;