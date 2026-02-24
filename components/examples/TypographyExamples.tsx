/**
 * Typography Examples
 * 
 * This file demonstrates the usage of the Sandstone typography system.
 * Use these examples as a reference for implementing typography in your components.
 */

import React from "react";

// ============================================================================
// DISPLAY HEADINGS
// ============================================================================

export function DisplayHeadings() {
  return (
    <div className="space-y-8">
      <h1 className="font-display text-display-4xl">
        Display 4XL - Hero Title
      </h1>
      <h1 className="font-display text-display-3xl">
        Display 3XL - Large Hero
      </h1>
      <h1 className="font-display text-display-2xl">
        Display 2XL - Medium Hero
      </h1>
      <h1 className="font-display text-display-xl">
        Display XL - Section Hero
      </h1>
      <h1 className="font-display text-display-lg">
        Display LG - Feature Title
      </h1>
      <h1 className="font-display text-display">
        Display - Compact Title
      </h1>
      <h1 className="font-display text-display-sm">
        Display SM - Small Title
      </h1>
    </div>
  );
}

// ============================================================================
// CONTENT HEADINGS
// ============================================================================

export function ContentHeadings() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-h1">H1 - Page Title</h1>
      <h2 className="font-display text-h2">H2 - Section Heading</h2>
      <h3 className="font-sans text-h3">H3 - Subsection Heading</h3>
      <h4 className="font-sans text-h4">H4 - Small Heading</h4>
      <h5 className="font-sans text-h5">H5 - Minor Heading</h5>
      <h6 className="font-sans text-h6">H6 - Tiny Heading (Uppercase)</h6>
    </div>
  );
}

// ============================================================================
// BODY TEXT
// ============================================================================

export function BodyText() {
  return (
    <div className="space-y-4 max-w-prose">
      <p className="text-body-xl">
        Body XL (20px) - Used for important introductory paragraphs or 
        highlighted content that needs to stand out from regular body text.
      </p>
      <p className="text-body-lg">
        Body LG (18px) - Great for lead paragraphs, summaries, or content 
        that benefits from slightly larger text for improved readability.
      </p>
      <p className="text-body">
        Body (16px) - The standard text size for most content. Optimized 
        for comfortable reading with a line height of 1.65 for excellent 
        readability across all devices.
      </p>
      <p className="text-body-sm">
        Body SM (14px) - Used for secondary content, metadata, descriptions, 
        and any text that should be slightly less prominent than standard body.
      </p>
      <p className="text-body-xs">
        Body XS (12px) - For fine print, legal text, timestamps, and other 
        content that needs to be small but still readable.
      </p>
    </div>
  );
}

// ============================================================================
// SPECIAL TEXT
// ============================================================================

export function SpecialText() {
  return (
    <div className="space-y-6">
      {/* Overline */}
      <div>
        <span className="text-overline text-primary">Category</span>
        <h2 className="font-display text-h2 mt-1">Article Title</h2>
      </div>

      {/* Labels */}
      <div className="space-y-2">
        <label className="text-label">Form Label</label>
        <label className="text-label-sm">Small Form Label</label>
      </div>

      {/* Captions */}
      <div className="space-y-2">
        <figcaption className="text-caption">
          Figure 1: A descriptive caption for an image
        </figcaption>
        <span className="text-caption-sm">
          Fine print or legal disclaimer text
        </span>
      </div>

      {/* Lead Text */}
      <p className="text-lead">
        Lead paragraph with muted color, perfect for introductions 
        and summaries that set the context for the content that follows.
      </p>

      {/* Blockquote */}
      <blockquote className="text-quote">
        "Education is not the filling of a pail, but the lighting of a fire."
        <cite className="block mt-2 text-body-sm not-italic">— William Butler Yeats</cite>
      </blockquote>

      {/* Code */}
      <div className="space-y-2">
        <p className="text-body">
          Use the <code className="text-code">console.log()</code> function 
          for debugging your JavaScript code.
        </p>
        <pre className="text-code-block bg-muted p-4 rounded-lg overflow-x-auto">
          {`function greet(name) {
  return \`Hello, \${name}!\`;
}`}
        </pre>
      </div>

      {/* Keyboard Shortcuts */}
      <p className="text-body-sm">
        Press <kbd className="text-kbd">Ctrl</kbd> +{" "}
        <kbd className="text-kbd">K</kbd> to open the command palette
      </p>
    </div>
  );
}

// ============================================================================
// PROSE CONTENT
// ============================================================================

export function ProseContent() {
  return (
    <article className="prose">
      <h1>The Art of Learning</h1>
      <p className="text-lead">
        Learning is a lifelong journey that requires dedication, curiosity, 
        and the right tools to succeed.
      </p>
      <p>
        Effective learning involves more than just memorizing facts. It requires 
        understanding concepts deeply, making connections between ideas, and 
        applying knowledge in practical contexts. With the right approach, anyone 
        can master complex subjects and achieve their educational goals.
      </p>
      <h2>Key Principles</h2>
      <ul>
        <li>Active engagement with the material</li>
        <li>Regular practice and review</li>
        <li>Seeking feedback and improvement</li>
        <li>Making connections to real-world applications</li>
      </ul>
      <blockquote>
        "The beautiful thing about learning is that no one can take it away from you."
      </blockquote>
      <p>
        By following these principles and using modern learning tools, you can 
        accelerate your progress and achieve mastery in any subject you choose 
        to pursue.
      </p>
    </article>
  );
}

// ============================================================================
// TEXT UTILITIES
// ============================================================================

export function TextUtilities() {
  return (
    <div className="space-y-6">
      {/* Line Clamping */}
      <div className="space-y-2">
        <h3 className="font-sans text-h5">Line Clamping</h3>
        <p className="line-clamp-2 text-body max-w-md">
          This text will be truncated after exactly two lines. Any content 
          beyond that will be hidden with an ellipsis at the end. This is 
          useful for card descriptions, list items, and anywhere you need 
          to limit text to a specific number of lines.
        </p>
      </div>

      {/* Text Balance */}
      <div className="space-y-2">
        <h3 className="font-sans text-h5">Text Balance</h3>
        <h4 className="font-display text-h3 text-balance max-w-md">
          This heading has balanced line breaks for better visual appeal
        </h4>
      </div>

      {/* Prose Width */}
      <div className="space-y-2">
        <h3 className="font-sans text-h5">Prose Width</h3>
        <p className="text-body prose-narrow border p-4">
          Narrow prose (60ch max) - Best for focused reading
        </p>
        <p className="text-body prose-default border p-4">
          Default prose (70ch max) - Standard comfortable reading width
        </p>
        <p className="text-body prose-wide border p-4">
          Wide prose (80ch max) - For content that needs more space
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPLETE PAGE EXAMPLE
// ============================================================================

export function PageExample() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto p-8">
      {/* Header */}
      <header className="space-y-4 text-center">
        <span className="text-overline text-primary">Getting Started</span>
        <h1 className="font-display text-display-lg text-balance">
          Welcome to Sandstone
        </h1>
        <p className="text-lead max-w-2xl mx-auto">
          Your AI-powered learning companion for mastering A-Level subjects 
          with personalized feedback and guidance.
        </p>
      </header>

      {/* Features */}
      <section className="space-y-8">
        <h2 className="font-display text-h2">Key Features</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6 space-y-3">
            <h3 className="font-sans text-h4">AI-Powered Feedback</h3>
            <p className="text-body-sm text-muted-foreground">
              Get detailed, examiner-level feedback on your responses to 
              understand exactly where you can improve.
            </p>
            <span className="text-caption text-primary">Learn more →</span>
          </div>
          
          <div className="card p-6 space-y-3">
            <h3 className="font-sans text-h4">Personalized Study Plans</h3>
            <p className="text-body-sm text-muted-foreground">
              Track your progress and receive customized study recommendations 
              based on your performance.
            </p>
            <span className="text-caption text-primary">Learn more →</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-4">
        <h2 className="font-display text-h3">Ready to Start Learning?</h2>
        <p className="text-body text-muted-foreground">
          Join thousands of students achieving their academic goals
        </p>
        <button className="btn btn-primary">
          Get Started Free
        </button>
        <p className="text-caption-sm text-muted-foreground">
          No credit card required
        </p>
      </section>
    </div>
  );
}

// ============================================================================
// TYPOGRAPHY SHOWCASE
// ============================================================================

export function TypographyShowcase() {
  return (
    <div className="space-y-16 p-8">
      <section>
        <h2 className="font-sans text-h5 text-muted-foreground mb-6 uppercase tracking-wide">
          Display Headings
        </h2>
        <DisplayHeadings />
      </section>

      <section>
        <h2 className="font-sans text-h5 text-muted-foreground mb-6 uppercase tracking-wide">
          Content Headings
        </h2>
        <ContentHeadings />
      </section>

      <section>
        <h2 className="font-sans text-h5 text-muted-foreground mb-6 uppercase tracking-wide">
          Body Text
        </h2>
        <BodyText />
      </section>

      <section>
        <h2 className="font-sans text-h5 text-muted-foreground mb-6 uppercase tracking-wide">
          Special Text
        </h2>
        <SpecialText />
      </section>

      <section>
        <h2 className="font-sans text-h5 text-muted-foreground mb-6 uppercase tracking-wide">
          Prose Content
        </h2>
        <ProseContent />
      </section>

      <section>
        <h2 className="font-sans text-h5 text-muted-foreground mb-6 uppercase tracking-wide">
          Text Utilities
        </h2>
        <TextUtilities />
      </section>

      <section>
        <h2 className="font-sans text-h5 text-muted-foreground mb-6 uppercase tracking-wide">
          Complete Page Example
        </h2>
        <PageExample />
      </section>
    </div>
  );
}

export default TypographyShowcase;
