"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

{
  /* Custom CSS for animations */
}
<style jsx global>{`
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes gentle-bounce {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-3px);
    }
  }

  @keyframes blob-float {
    0%,
    100% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
  }

  @keyframes smooth-slide-in {
    0% {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translateY(0px) scale(1);
    }
  }

  .animate-fade-in-up {
    animation: fade-in-up 1.2s ease-out forwards;
    opacity: 0;
  }

  .animate-float {
    animation: float 4s ease-in-out infinite;
  }

  .animate-gentle-bounce {
    animation: gentle-bounce 2.5s ease-in-out infinite;
  }

  .animate-blob-float {
    animation: blob-float 20s ease-in-out infinite;
  }

  .animate-smooth-slide-in {
    animation: smooth-slide-in 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    opacity: 0;
  }
`}</style>;
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
  Upload,
  Search,
  FileCheck,
  Lock,
  Eye,
  HelpCircle,
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      {/* Fixed Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary">
                GuardiaContrato
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Cómo Funciona
              </a>
              <a
                href="#privacy"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Privacidad y Seguridad
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Precios
              </a>
              <a
                href="#faq"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Preguntas Frecuentes
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
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
      <section className="relative pt-32 pb-32 px-4 md:px-6 lg:px-8 min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-white via-blue-50/30 to-gray-50 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large Blurred Blobs */}
          <div
            className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-400/20 rounded-full blur-3xl animate-blob-float"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-teal-400/25 to-blue-400/15 rounded-full blur-3xl animate-blob-float"
            style={{ animationDelay: "7s" }}
          ></div>
          <div
            className="absolute top-1/4 right-1/4 w-80 h-80 bg-gradient-to-bl from-purple-400/20 to-pink-400/15 rounded-full blur-2xl animate-blob-float"
            style={{ animationDelay: "14s" }}
          ></div>
          <div
            className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-gradient-to-tr from-indigo-400/25 to-cyan-400/20 rounded-full blur-2xl animate-blob-float"
            style={{ animationDelay: "3s" }}
          ></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-primary animate-smooth-slide-in">
            <span
              className="inline-block animate-gentle-bounce"
              style={{ animationDelay: "0.3s" }}
            >
              Revisa
            </span>{" "}
            <span
              className="inline-block animate-gentle-bounce"
              style={{ animationDelay: "0.5s" }}
            >
              Contratos
            </span>{" "}
            <span
              className="inline-block animate-gentle-bounce"
              style={{ animationDelay: "0.7s" }}
            >
              con
            </span>{" "}
            <span
              className="inline-block animate-gentle-bounce bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent"
              style={{ animationDelay: "0.9s" }}
            >
              Confianza
            </span>
          </h1>
          <p
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto animate-smooth-slide-in"
            style={{ animationDelay: "0.7s" }}
          >
            Obtén análisis instantáneo de tus documentos legales. Identifica
            cláusulas riesgosas, comprende tus obligaciones y toma decisiones
            informadas antes de firmar.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-smooth-slide-in"
            style={{ animationDelay: "0.9s" }}
          >
            <Link href="/register">
              <Button
                size="lg"
                className="px-8 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Upload className="mr-2 h-5 w-5" />
                Subir Documento
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="px-8 transform hover:scale-105 transition-all duration-300 hover:bg-primary hover:text-white"
            >
              Saber Más
            </Button>
          </div>
          <p
            className="text-sm text-gray-500 mt-6 animate-smooth-slide-in"
            style={{ animationDelay: "1.1s" }}
          >
            Tus documentos nunca se almacenan • Completamente confidencial •
            Resultados instantáneos
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-16 px-4 md:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-primary">
            Cómo Funciona
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Obtén análisis de contratos de nivel profesional en tres simples
            pasos
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-center text-primary">
                  1. Sube tu Documento
                </CardTitle>
                <CardDescription className="text-center">
                  Sube de forma segura tu contrato, arrendamiento o acuerdo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  Soporta PDF, Word y otros formatos de documentos comunes. Tu
                  archivo se procesa instantáneamente y nunca se almacena en
                  nuestros servidores.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-center text-primary">
                  2. Análisis Instantáneo
                </CardTitle>
                <CardDescription className="text-center">
                  Algoritmos avanzados escanean cada cláusula y término
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  Nuestro sistema identifica riesgos potenciales, términos
                  injustos y obligaciones importantes que debes conocer antes de
                  firmar.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FileCheck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-center text-primary">
                  3. Revisa los Resultados
                </CardTitle>
                <CardDescription className="text-center">
                  Obtén un reporte claro y codificado por colores con
                  información práctica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-600">
                  Comprende exactamente a qué te estás comprometiendo con
                  explicaciones en lenguaje sencillo y evaluaciones de riesgo
                  para cada sección.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section id="privacy" className="py-16 px-4 md:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-primary">
            Tu Privacidad es Nuestra Prioridad
          </h2>
          <p className="text-lg text-gray-600 text-center mb-8 max-w-3xl mx-auto">
            Entendemos la naturaleza sensible de los documentos legales. Por eso
            hemos construido nuestra plataforma con la privacidad y seguridad
            como base.
          </p>
          <div className="text-center mb-12">
            <p className="text-gray-600 mb-4">
              Te animamos a revisar cómo manejamos tus datos y nuestros
              compromisos legales contigo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/privacy-policy">
                <Button variant="outline" size="sm" className="px-6">
                  <Shield className="mr-2 h-4 w-4" />
                  Revisar Política de Privacidad
                </Button>
              </Link>
              <Link href="/terms-of-service">
                <Button variant="outline" size="sm" className="px-6">
                  <FileText className="mr-2 h-4 w-4" />
                  Leer Términos de Servicio
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-green-600">
                  Sin Almacenamiento de Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Tus documentos se procesan instantáneamente y se eliminan
                  inmediatamente. Solo guardamos los resultados del análisis,
                  nunca tus archivos originales.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-blue-600">
                  Procesamiento Encriptado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Todas las cargas y procesamiento de documentos ocurren a
                  través de conexiones encriptadas. Tus datos están protegidos
                  en cada paso.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-purple-600">
                  Confidencialidad Completa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Los resultados de tu análisis son privados para ti. Nunca
                  compartimos, vendemos o usamos tu información para ningún
                  propósito que no sea brindar nuestro servicio.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Output Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-primary">
            Ve lo que Obtienes
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Nuestro análisis proporciona información clara y codificada por
            colores para que sepas exactamente qué estás firmando
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Sample Document View */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                Análisis Codificado por Colores
              </h3>
              <Card className="bg-gray-50 border border-gray-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-green-700">
                          ✓ Términos Estándar:
                        </span>{" "}
                        Esta cláusula proporciona períodos de aviso justos y
                        sigue estándares de la industria.
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-yellow-700">
                          ⚠ Revisión Necesaria:
                        </span>{" "}
                        Esta cláusula de terminación puede ser más restrictiva
                        que los acuerdos típicos.
                      </p>
                    </div>
                    <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-red-700">
                          ⚠ Alto Riesgo:
                        </span>{" "}
                        Esta cláusula de responsabilidad podría exponerte a una
                        responsabilidad financiera significativa.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Report */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-primary">
                Reporte Resumen
              </h3>
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Resumen de Análisis de Contrato
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Nivel de Riesgo General:
                      </span>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Medio
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cláusulas Seguras:</span>
                      <span className="text-green-600 font-medium">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Revisión Recomendada:
                      </span>
                      <span className="text-yellow-600 font-medium">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Elementos de Alto Riesgo:
                      </span>
                      <span className="text-red-600 font-medium">1</span>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        <strong>Recomendación Clave:</strong> Considera negociar
                        la cláusula de responsabilidad en la sección 4.2 para
                        limitar tu exposición financiera.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section id="pricing" className="py-16 px-4 md:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-primary">
            Elige tu Plan
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Selecciona el plan perfecto para tus necesidades de análisis de
            contratos
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Freemium Plan */}
            <Card className="relative bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Gratis</CardTitle>
                <CardDescription className="text-lg">
                  Perfecto para probar nuestro servicio
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">$0</span>
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
                    <span>Límite de carga: 3 archivos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Solo análisis automatizado</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <XCircle className="h-4 w-4" />
                    <span>Sin revisión humana</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <XCircle className="h-4 w-4" />
                    <span>Soporte estándar</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-400">
                    <XCircle className="h-4 w-4" />
                    <span>Sin descuento en compra de tokens</span>
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
            <Card className="relative bg-white border-2 border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                  Más Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Básico</CardTitle>
                <CardDescription className="text-lg">
                  Excelente para usuarios regulares
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">$19</span>
                  <span className="text-gray-600">/mes</span>
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
                    <span>Cargas de archivos ilimitadas</span>
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
                    <span>5% descuento en compra de tokens</span>
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
            <Card className="relative bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">
                  Avanzado
                </CardTitle>
                <CardDescription className="text-lg">
                  Para usuarios avanzados y empresas
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-primary">$49</span>
                  <span className="text-gray-600">/mes</span>
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
                    <span>Cargas de archivos ilimitadas</span>
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
                    <span>10% descuento en compra de tokens</span>
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
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-center text-primary">
                  Cómo Funcionan los Tokens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-3 text-primary">
                      Uso de Tokens
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Los tokens se consumen al analizar documentos</li>
                      <li>
                        • El uso depende del tamaño y complejidad del documento
                      </li>
                      <li>• Documento típico: 1-5 tokens</li>
                      <li>• Contratos grandes: 5-15 tokens</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-primary">
                      Tokens Adicionales
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>
                        • Todos los planes pueden comprar tokens adicionales
                      </li>
                      <li>• Gratis: $0.10 por token</li>
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

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 md:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-primary">
            Preguntas Frecuentes
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12">
            Obtén respuestas a preguntas comunes sobre nuestro servicio
          </p>
          <div className="space-y-6">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <HelpCircle className="h-5 w-5" />
                  ¿Qué pasa con mis documentos después de subirlos?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Tus documentos se procesan inmediatamente y luego se eliminan
                  permanentemente de nuestros servidores. Solo conservamos los
                  resultados del análisis, nunca tus archivos originales. Esto
                  garantiza privacidad y confidencialidad completas.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <HelpCircle className="h-5 w-5" />
                  ¿Qué tan preciso es el análisis de contratos?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Nuestro sistema de análisis está entrenado con miles de
                  documentos legales y proporciona evaluaciones de riesgo
                  altamente precisas. Sin embargo, nuestro servicio está
                  diseñado para complementar, no reemplazar, el asesoramiento
                  legal profesional para situaciones complejas.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <HelpCircle className="h-5 w-5" />
                  ¿Qué tipos de documentos puedo analizar?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Soportamos contratos de empleo, acuerdos de arrendamiento,
                  contratos de servicio, NDAs, acuerdos de compra y la mayoría
                  de otros documentos legales. Aceptamos PDF, Word y otros
                  formatos de documentos comunes.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <HelpCircle className="h-5 w-5" />
                  ¿Es segura mi información?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sí, absolutamente. Todas las cargas están encriptadas, los
                  documentos nunca se almacenan, y los resultados de tu análisis
                  son privados para tu cuenta. Seguimos prácticas de seguridad
                  estándar de la industria para proteger tu información.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <HelpCircle className="h-5 w-5" />
                  ¿Puedo obtener un reembolso si no estoy satisfecho?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ofrecemos una garantía de devolución de dinero de 30 días para
                  todos los planes pagos. Si no estás completamente satisfecho
                  con nuestro servicio, contáctanos para un reembolso completo
                  dentro de los 30 días de tu suscripción.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para Revisar tus Contratos con Confianza?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de usuarios que confían en GuardiaContrato para
            proteger sus intereses. Comienza hoy con tu análisis gratuito.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="px-8">
              Comenzar Análisis Gratuito
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-6 lg:px-8 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-primary">
                GuardiaContrato
              </h3>
              <p className="text-gray-600">
                Análisis profesional de contratos para ayudarte a tomar
                decisiones informadas con confianza.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-primary">Producto</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#how-it-works"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Cómo Funciona
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Precios
                  </Link>
                </li>
                <li>
                  <Link
                    href="#faq"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Preguntas Frecuentes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-primary">Empresa</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Acerca de Nosotros
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Soporte
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4 text-primary">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Términos de Servicio
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Seguridad
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-300 text-center text-gray-600">
            <p>
              &copy; {new Date().getFullYear()} GuardiaContrato. Todos los
              derechos reservados. • Protegiendo tus intereses, un contrato a la
              vez.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
