import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  FileText,
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-background to-muted">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            AI-Powered Legal Document Analysis
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Upload your legal documents and get instant AI analysis to identify
            potential flaws before signing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="px-8">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card">
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Upload Your Document</CardTitle>
                <CardDescription>
                  Securely upload any legal document that requires your
                  signature.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Our platform accepts PDFs and common document formats with
                  drag-and-drop simplicity.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Analysis</CardTitle>
                <CardDescription>
                  Our advanced AI scans your document for potential issues.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  The system identifies concerning clauses and problematic
                  language that could affect you.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Review Results</CardTitle>
                <CardDescription>
                  Get a comprehensive assessment with plain language
                  explanations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Color-coded sections highlight good, concerning, and
                  problematic clauses in your document.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Analysis Showcase */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-muted">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comprehensive Document Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-l-4 border-green-500">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-green-500">The Good</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  Identifies fair terms and standard clauses that protect both
                  parties.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-amber-500">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-amber-500">
                    The Concerning
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  Highlights potentially unfavorable terms that may need
                  negotiation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-red-500">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-red-500">
                    The Problematic
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  Flags serious issues that could have significant negative
                  consequences.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-card">
              <CardContent className="pt-6">
                <p className="italic mb-4">
                  "This tool saved me from signing a lease with hidden fees. The
                  AI highlighted clauses I would have missed, and the plain
                  language explanations helped me understand exactly what I was
                  agreeing to."
                </p>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                    <span className="font-semibold">JD</span>
                  </div>
                  <div>
                    <p className="font-medium">Jane Doe</p>
                    <p className="text-sm text-muted-foreground">Tenant</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent className="pt-6">
                <p className="italic mb-4">
                  "As a small business owner, I don't have the budget for
                  expensive legal reviews. This platform helps me understand
                  contracts before I sign them, giving me confidence in my
                  business decisions."
                </p>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                    <span className="font-semibold">JS</span>
                  </div>
                  <div>
                    <p className="font-medium">John Smith</p>
                    <p className="text-sm text-muted-foreground">
                      Business Owner
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to analyze your documents?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Sign up today and get your first document analysis for free.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="px-8">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-6 lg:px-8 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Legal Document AI</h3>
              <p className="text-muted-foreground">
                AI-powered document analysis to help you make informed
                decisions.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Legal Document AI. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
