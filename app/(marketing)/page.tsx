import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Sparkles,
  Zap,
  BookOpen,
  Target,
  BarChart3,
  Clock,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sandstone - AI-Powered A-Level Learning",
  description: "Master Economics and Geography with AI-powered tutoring, instant essay grading, and personalized study tools.",
};

const features = [
  {
    icon: GraduationCap,
    title: "AI Essay Grading",
    description: "Get instant, detailed feedback on your A-Level responses based on official Edexcel mark schemes.",
  },
  {
    icon: Sparkles,
    title: "Smart Flashcards",
    description: "Learn efficiently with AI-generated flashcards and spaced repetition scheduling.",
  },
  {
    icon: Zap,
    title: "Interactive Quizzes",
    description: "Test your knowledge with AI-generated quizzes tailored to your learning progress.",
  },
  {
    icon: BookOpen,
    title: "Study Library",
    description: "Access curated study materials, past papers, and revision resources.",
  },
  {
    icon: Target,
    title: "Personalized Learning",
    description: "AI adapts to your strengths and weaknesses for a customized learning experience.",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description: "Monitor your improvement with detailed analytics and performance insights.",
  },
];

const subjects = [
  {
    name: "Economics",
    topics: ["Microeconomics", "Macroeconomics", "Market Structures", "Development Economics"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Geography",
    topics: ["Physical Geography", "Human Geography", "Fieldwork", "Global Issues"],
    color: "from-emerald-500 to-teal-500",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10" />
        <div className="container relative py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered A-Level Learning</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Master Your A-Levels with{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                AI Tutoring
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Get instant essay feedback, personalized study plans, and AI-generated practice materials for Economics and Geography.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>14-day free trial</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground">
              Comprehensive tools designed specifically for A-Level students
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-background border hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section className="py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Subjects We Cover</h2>
            <p className="text-muted-foreground">
              Expert AI tutoring for Edexcel A-Level subjects
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {subjects.map((subject) => (
              <div
                key={subject.name}
                className="relative overflow-hidden rounded-2xl border p-8"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${subject.color} opacity-10 rounded-bl-full`} />
                <h3 className="text-2xl font-bold mb-4">{subject.name}</h3>
                <ul className="space-y-2">
                  {subject.topics.map((topic) => (
                    <li key={topic} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-muted/50">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-accent mb-2">10,000+</div>
              <div className="text-muted-foreground">Essays Graded</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">5,000+</div>
              <div className="text-muted-foreground">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">95%</div>
              <div className="text-muted-foreground">Grade Improvement</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">24/7</div>
              <div className="text-muted-foreground">AI Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of A-Level students achieving their academic goals with AI-powered tutoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Get Started Free
                </Button>
              </Link>
              <Link href="/grade">
                <Button size="lg" variant="outline" className="gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Try AI Grading
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
