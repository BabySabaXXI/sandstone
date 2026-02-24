#!/usr/bin/env node

/**
 * Sandstone Design Consistency Checker
 * ====================================
 * This script checks the codebase for design inconsistencies and
 * provides recommendations for fixes.
 * 
 * Usage:
 *   node consistency-check.js [options]
 * 
 * Options:
 *   --fix       Auto-fix issues where possible
 *   --report    Generate a detailed report
 *   --json      Output results as JSON
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

// ============================================
// Configuration
// ============================================

const CONFIG = {
  // Directories to scan
  scanDirs: ['app', 'components', 'lib'],
  
  // File patterns to check
  filePatterns: ['**/*.tsx', '**/*.ts', '**/*.css'],
  
  // Patterns to ignore
  ignorePatterns: ['node_modules/**', '.next/**', 'dist/**'],
  
  // Design tokens that should be used
  allowedColors: [
    'var(--color-',
    'bg-sand-',
    'text-sand-',
    'border-sand-',
    'bg-surface',
    'text-text-',
    'border-border',
    'bg-cement',
    'bg-charcoal',
    'manus.',
  ],
  
  // Forbidden hardcoded values
  forbiddenColors: [
    '#fff',
    '#ffffff',
    '#000',
    '#000000',
    'rgb(0,0,0)',
    'rgb(255,255,255)',
    'rgba(0,0,0',
    'rgba(255,255,255',
  ],
  
  // Allowed spacing values (from design tokens)
  allowedSpacing: [
    'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8', 'p-10', 'p-12',
    'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-8', 'm-10', 'm-12',
    'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-5', 'gap-6', 'gap-8',
    'space-x-', 'space-y-',
    'px-4', 'py-2', 'px-6', 'py-3',
  ],
  
  // Component naming patterns
  componentNaming: {
    pattern: /^[A-Z][a-zA-Z0-9]*$/,
    message: 'Components should use PascalCase',
  },
  
  // Hook naming patterns
  hookNaming: {
    pattern: /^use[A-Z][a-zA-Z0-9]*$/,
    message: 'Hooks should use camelCase with "use" prefix',
  },
};

// ============================================
// Issue Types
// ============================================

const ISSUE_TYPES = {
  HARDCODED_COLOR: {
    severity: 'warning',
    message: 'Hardcoded color value found',
    fixable: true,
  },
  INCONSISTENT_SPACING: {
    severity: 'info',
    message: 'Spacing value not from design system',
    fixable: false,
  },
  MISSING_DISPLAY_NAME: {
    severity: 'warning',
    message: 'Component missing displayName',
    fixable: true,
  },
  INCONSISTENT_NAMING: {
    severity: 'error',
    message: 'Component naming does not follow conventions',
    fixable: false,
  },
  INLINE_STYLES: {
    severity: 'warning',
    message: 'Inline styles should use Tailwind classes',
    fixable: false,
  },
  MISSING_ACCESSIBILITY: {
    severity: 'error',
    message: 'Interactive element missing accessibility attributes',
    fixable: false,
  },
};

// ============================================
// Checker Functions
// ============================================

class ConsistencyChecker {
  constructor(options = {}) {
    this.options = options;
    this.issues = [];
    this.filesChecked = 0;
    this.componentsFound = 0;
  }

  /**
   * Run all checks
   */
  run() {
    console.log('🔍 Sandstone Design Consistency Checker\n');
    
    const files = this.getFilesToCheck();
    console.log(`Found ${files.length} files to check\n`);
    
    for (const file of files) {
      this.checkFile(file);
    }
    
    this.printSummary();
    
    if (this.options.json) {
      return this.generateJSONReport();
    }
    
    return this.issues;
  }

  /**
   * Get list of files to check
   */
  getFilesToCheck() {
    const files = [];
    
    for (const dir of CONFIG.scanDirs) {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) continue;
      
      for (const pattern of CONFIG.filePatterns) {
        const matches = globSync(path.join(dir, pattern), {
          ignore: CONFIG.ignorePatterns,
        });
        files.push(...matches);
      }
    }
    
    return [...new Set(files)];
  }

  /**
   * Check a single file
   */
  checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    this.filesChecked++;
    
    // Check for hardcoded colors
    this.checkHardcodedColors(filePath, content);
    
    // Check for inline styles
    this.checkInlineStyles(filePath, content);
    
    // Check component naming
    this.checkComponentNaming(filePath, content);
    
    // Check for displayName
    this.checkDisplayName(filePath, content);
    
    // Check accessibility
    this.checkAccessibility(filePath, content);
    
    // Check imports
    this.checkImports(filePath, content);
  }

  /**
   * Check for hardcoded color values
   */
  checkHardcodedColors(filePath, content) {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for hex colors
      const hexColorMatch = line.match(/#[0-9A-Fa-f]{3,8}/g);
      if (hexColorMatch) {
        for (const color of hexColorMatch) {
          // Skip if it's a design token color
          if (this.isDesignTokenColor(color, line)) continue;
          
          this.addIssue({
            type: 'HARDCODED_COLOR',
            file: filePath,
            line: i + 1,
            column: line.indexOf(color) + 1,
            message: `Hardcoded color: ${color}`,
            code: line.trim(),
            suggestion: this.suggestColorToken(color),
          });
        }
      }
      
      // Check for rgb/rgba colors
      const rgbMatch = line.match(/rgba?\([^)]+\)/g);
      if (rgbMatch) {
        for (const color of rgbMatch) {
          this.addIssue({
            type: 'HARDCODED_COLOR',
            file: filePath,
            line: i + 1,
            column: line.indexOf(color) + 1,
            message: `Hardcoded RGB color: ${color}`,
            code: line.trim(),
            suggestion: 'Use design token colors instead',
          });
        }
      }
    }
  }

  /**
   * Check for inline styles
   */
  checkInlineStyles(filePath, content) {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for style={{}} pattern
      if (line.includes('style={{') || line.includes('style={')) {
        this.addIssue({
          type: 'INLINE_STYLES',
          file: filePath,
          line: i + 1,
          message: 'Inline styles detected',
          code: line.trim(),
          suggestion: 'Use Tailwind CSS classes instead',
        });
      }
    }
  }

  /**
   * Check component naming conventions
   */
  checkComponentNaming(filePath, content) {
    // Check for component declarations
    const componentMatches = content.match(/(?:function|const|class)\s+([A-Z][a-zA-Z0-9]*)/g);
    
    if (componentMatches) {
      for (const match of componentMatches) {
        const name = match.replace(/(?:function|const|class)\s+/, '');
        
        if (!CONFIG.componentNaming.pattern.test(name)) {
          this.addIssue({
            type: 'INCONSISTENT_NAMING',
            file: filePath,
            line: this.findLineNumber(content, match),
            message: `Component "${name}" does not follow naming convention`,
            suggestion: CONFIG.componentNaming.message,
          });
        }
        
        this.componentsFound++;
      }
    }
  }

  /**
   * Check for displayName
   */
  checkDisplayName(filePath, content) {
    // Check for forwardRef components without displayName
    if (content.includes('forwardRef') && !content.includes('.displayName')) {
      this.addIssue({
        type: 'MISSING_DISPLAY_NAME',
        file: filePath,
        line: 1,
        message: 'Component using forwardRef is missing displayName',
        suggestion: 'Add ComponentName.displayName = "ComponentName"',
      });
    }
  }

  /**
   * Check accessibility
   */
  checkAccessibility(filePath, content) {
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for clickable divs
      if (line.includes('onClick') && line.includes('<div') && !line.includes('role=')) {
        this.addIssue({
          type: 'MISSING_ACCESSIBILITY',
          file: filePath,
          line: i + 1,
          message: 'Clickable div missing role attribute',
          code: line.trim(),
          suggestion: 'Add role="button" and tabIndex={0}',
        });
      }
      
      // Check for images without alt
      if (line.includes('<img') && !line.includes('alt=')) {
        this.addIssue({
          type: 'MISSING_ACCESSIBILITY',
          file: filePath,
          line: i + 1,
          message: 'Image missing alt attribute',
          code: line.trim(),
          suggestion: 'Add alt attribute for accessibility',
        });
      }
    }
  }

  /**
   * Check imports
   */
  checkImports(filePath, content) {
    // Check for consistent import patterns
    const relativeImportPattern = /from\s+['"]\.\.\/\.\.\//g;
    const matches = content.match(relativeImportPattern);
    
    if (matches && matches.length > 2) {
      this.addIssue({
        type: 'INCONSISTENT_SPACING',
        file: filePath,
        line: 1,
        message: 'Deep relative imports detected',
        suggestion: 'Use path aliases (@/components) instead',
      });
    }
  }

  /**
   * Check if a color is a design token
   */
  isDesignTokenColor(color, line) {
    // Check if line contains a design token reference
    for (const token of CONFIG.allowedColors) {
      if (line.includes(token)) return true;
    }
    return false;
  }

  /**
   * Suggest a color token for a hardcoded color
   */
  suggestColorToken(color) {
    const colorMap = {
      '#fff': 'var(--color-surface) or bg-white',
      '#ffffff': 'var(--color-surface) or bg-white',
      '#000': 'var(--color-text-primary) or text-black',
      '#000000': 'var(--color-text-primary) or text-black',
    };
    
    return colorMap[color.toLowerCase()] || 'Use a design token from tokens.css';
  }

  /**
   * Find line number for a match
   */
  findLineNumber(content, match) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(match)) return i + 1;
    }
    return 1;
  }

  /**
   * Add an issue to the list
   */
  addIssue(issue) {
    const issueType = ISSUE_TYPES[issue.type];
    this.issues.push({
      ...issue,
      severity: issueType?.severity || 'info',
      fixable: issueType?.fixable || false,
    });
  }

  /**
   * Print summary of issues
   */
  printSummary() {
    console.log('\n📊 Summary\n');
    console.log(`Files checked: ${this.filesChecked}`);
    console.log(`Components found: ${this.componentsFound}`);
    console.log(`Issues found: ${this.issues.length}\n`);
    
    if (this.issues.length === 0) {
      console.log('✅ No issues found! Great job!\n');
      return;
    }
    
    // Group issues by severity
    const bySeverity = this.issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Issues by severity:');
    if (bySeverity.error) console.log(`  ❌ Errors: ${bySeverity.error}`);
    if (bySeverity.warning) console.log(`  ⚠️  Warnings: ${bySeverity.warning}`);
    if (bySeverity.info) console.log(`  ℹ️  Info: ${bySeverity.info}`);
    
    // Show detailed issues
    console.log('\n📋 Detailed Issues:\n');
    
    const byFile = this.issues.reduce((acc, issue) => {
      if (!acc[issue.file]) acc[issue.file] = [];
      acc[issue.file].push(issue);
      return acc;
    }, {});
    
    for (const [file, issues] of Object.entries(byFile)) {
      console.log(`\n${file}:`);
      for (const issue of issues) {
        const icon = issue.severity === 'error' ? '❌' : 
                     issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`  ${icon} Line ${issue.line}: ${issue.message}`);
        if (issue.suggestion) {
          console.log(`     💡 ${issue.suggestion}`);
        }
      }
    }
    
    console.log('\n');
  }

  /**
   * Generate JSON report
   */
  generateJSONReport() {
    return JSON.stringify({
      summary: {
        filesChecked: this.filesChecked,
        componentsFound: this.componentsFound,
        totalIssues: this.issues.length,
        errors: this.issues.filter(i => i.severity === 'error').length,
        warnings: this.issues.filter(i => i.severity === 'warning').length,
        info: this.issues.filter(i => i.severity === 'info').length,
      },
      issues: this.issues,
    }, null, 2);
  }
}

// ============================================
// CLI
// ============================================

function main() {
  const args = process.argv.slice(2);
  const options = {
    fix: args.includes('--fix'),
    report: args.includes('--report'),
    json: args.includes('--json'),
  };
  
  const checker = new ConsistencyChecker(options);
  const result = checker.run();
  
  if (options.json) {
    console.log(result);
  }
  
  // Exit with error code if there are errors
  const hasErrors = checker.issues.some(i => i.severity === 'error');
  process.exit(hasErrors ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { ConsistencyChecker, ISSUE_TYPES, CONFIG };
