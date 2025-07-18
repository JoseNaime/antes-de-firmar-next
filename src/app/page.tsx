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
      {/* Fixed Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Legal Document AI</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Características
              </a>
              <a
                href="#analysis"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Análisis
              </a>
              <a
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Precios
              </a>
              <a
                href="#testimonials"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Testimonios
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Iniciar sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Comenzar</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 lg:px-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-background to-muted">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Analiza tus documentos en segundos
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Identifica posibles fallas antes de firmar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="px-8">
                Comenzar <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-16 px-4 md:px-6 lg:px-8 bg-background"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Cómo Funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card">
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Sube tu Documento</CardTitle>
                <CardDescription>
                  Sube de forma segura cualquier documento legal que requiera tu firma.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Nuestra plataforma acepta PDFs y formatos de documento comunes con simplicidad de arrastrar y soltar.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Análisis con IA</CardTitle>
                <CardDescription>
                  Nuestra IA avanzada escanea tu documento en busca de posibles problemas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  El sistema identifica cláusulas preocupantes y lenguaje problemático que podría afectarte.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Revisa los Resultados</CardTitle>
                <CardDescription>
                  Obtén una evaluación completa con explicaciones en lenguaje sencillo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Secciones con códigos de color destacan las cláusulas buenas, preocupantes y problemáticas en tu documento.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Analysis Showcase */}
      <section id="analysis" className="py-16 px-4 md:px-6 lg:px-8 bg-muted">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Análisis Completo de Documentos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-l-4 border-green-500">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-green-500">Lo Bueno</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  Identifica términos justos y cláusulas estándar que protegen a ambas partes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-amber-500">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-amber-500">
                    Lo Preocupante
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  Destaca términos potencialmente desfavorables que pueden necesitar negociación.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-red-500">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-red-500">
                    Lo Problemático
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  Marca problemas serios que podrían tener consecuencias negativas significativas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section
        id="pricing"
        className="py-16 px-4 md:px-6 lg:px-8 bg-background"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Elige tu Plan
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Selecciona el plan perfecto para tus necesidades de análisis de documentos
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Freemium Plan */}
            <Card className="relative bg-card">
              <CardHeader>
                <CardTitle className="text-2xl">Gratuito</CardTitle>
                <CardDescription className="text-lg">
                  Perfecto para probar nuestro servicio
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Gratis</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>50 tokens/mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Límite de subida: 3 archivos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Solo revisión por IA</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="h-4 w-4" />
                    <span>Sin revisión humana</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="h-4 w-4" />
                    <span>Sin priorización de soporte</span>
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="h-4 w-4" />
                    <span>0% descuento en compras de tokens</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/register" className="w-full">
                  <Button className="w-full" variant="outline">
                    Comenzar
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Basic Plan */}
            <Card className="relative bg-card border-primary">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Más Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Básico</CardTitle>
                <CardDescription className="text-lg">
                  Excelente para usuarios regulares
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>100 tokens/mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Subidas de archivos ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Soporte estándar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Acceso a revisión humana</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>5% descuento en compras de tokens</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/register" className="w-full">
                  <Button className="w-full">Elegir Básico</Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Advanced Plan */}
            <Card className="relative bg-card">
              <CardHeader>
                <CardTitle className="text-2xl">Avanzado</CardTitle>
                <CardDescription className="text-lg">
                  Para usuarios avanzados y empresas
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-muted-foreground">/mes</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>500 tokens/mes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Subidas de archivos ilimitadas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Soporte prioritario</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Revisión humana con 10% descuento</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>10% descuento en compras de tokens</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/register" className="w-full">
                  <Button className="w-full" variant="outline">
                    Elegir Avanzado
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Token System Info */}
          <div className="mt-16">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-center">Cómo Funcionan los Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-3">Uso de Tokens</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Los tokens se consumen al analizar documentos</li>
                      <li>• El uso depende del tamaño y complejidad del documento</li>
                      <li>• Documento típico: 1-5 tokens</li>
                      <li>• Contratos grandes: 5-15 tokens</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Tokens Adicionales</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Todos los planes pueden comprar tokens adicionales</li>
                      <li>• Gratuito: $0.10 por token</li>
                      <li>• Básico: $0.095 por token (5% descuento)</li>
                      <li>• Avanzado: $0.09 por token (10% descuento)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="py-16 px-4 md:px-6 lg:px-8 bg-background"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Lo que Dicen Nuestros Usuarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-card">
              <CardContent className="pt-6">
                <p className="italic mb-4">
                  "Esta herramienta me salvó de firmar un contrato de arrendamiento con tarifas ocultas. La IA destacó cláusulas que habría pasado por alto, y las explicaciones en lenguaje sencillo me ayudaron a entender exactamente a qué me estaba comprometiendo."
                </p>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                    <span className="font-semibold">JD</span>
                  </div>
                  <div>
                    <p className="font-medium">Jane Doe</p>
                    <p className="text-sm text-muted-foreground">Inquilina</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardContent className="pt-6">
                <p className="italic mb-4">
                  "Como propietario de una pequeña empresa, no tengo el presupuesto para revisiones legales costosas. Esta plataforma me ayuda a entender los contratos antes de firmarlos, dándome confianza en mis decisiones empresariales."
                </p>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                    <span className="font-semibold">JS</span>
                  </div>
                  <div>
                    <p className="font-medium">John Smith</p>
                    <p className="text-sm text-muted-foreground">
                      Propietario de Negocio
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
            ¿Listo para analizar tus documentos?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Regístrate hoy y obtén tu primer análisis de documento gratis.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="px-8">
              Crear Cuenta Gratuita
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
                Análisis de documentos con IA para ayudarte a tomar decisiones informadas.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Producto</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Características
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Precios
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Preguntas Frecuentes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Acerca de
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
                    Contacto
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
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Términos de Servicio
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Legal Document AI. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
