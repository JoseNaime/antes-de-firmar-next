"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, Crown, Zap, AlertCircle, Loader2 } from "lucide-react";
import { getSubscriptionBenefits, getUserSubscription } from "@/lib/auth";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "@/lib/supabase";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface SubscriptionBenefit {
  id: string;
  tier: "freemium" | "basic" | "advanced";
  monthly_tokens: number;
  upload_limit: number | null;
  human_review_access: boolean;
  support_prioritization: string;
  token_purchase_discount: number;
}

interface UserSubscription {
  subscription_tier: "freemium" | "basic" | "advanced";
  is_active: boolean;
  subscription_benefits: SubscriptionBenefit;
}

interface SubscriptionPlansProps {
  userId: string;
  onSubscriptionChange?: () => void;
}

export default function SubscriptionPlans({
  userId,
  onSubscriptionChange,
}: SubscriptionPlansProps) {
  const [benefits, setBenefits] = useState<SubscriptionBenefit[]>([]);
  const [currentSubscription, setCurrentSubscription] =
    useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [benefitsData, subscriptionData] = await Promise.all([
        getSubscriptionBenefits(),
        getUserSubscription(userId),
      ]);

      setBenefits(benefitsData);
      setCurrentSubscription(subscriptionData);
    } catch (error) {
      console.error("Error loading subscription data:", error);
      setError("Error al cargar los planes de suscripción");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancellingSubscription(true);
      setError(null);

      // Get the current session to include auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Por favor, inicia sesión para cancelar la suscripción");
      }

      // Cancel subscription in Stripe first
      const stripeResponse = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const stripeData = await stripeResponse.json();

      if (!stripeResponse.ok) {
        throw new Error(
          stripeData.error || "No se pudo cancelar la suscripción en Stripe",
        );
      }

      console.log("Stripe cancellation result:", stripeData);

      // Update user subscription to freemium in database
      const { error: updateError } = await supabase
        .from("user_subscriptions")
        .update({
          subscription_tier: "freemium",
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("is_active", true);

      if (updateError) {
        throw updateError;
      }

      // Reload data to reflect changes
      await loadData();

      if (onSubscriptionChange) {
        onSubscriptionChange();
      }
    } catch (error: any) {
      console.error("Cancel subscription error:", error);
      setError(error.message || "No se pudo cancelar la suscripción");
    } finally {
      setCancellingSubscription(false);
    }
  };

  const getTierOrder = (tier: string): number => {
    switch (tier) {
      case "freemium":
        return 0;
      case "basic":
        return 1;
      case "advanced":
        return 2;
      default:
        return 0;
    }
  };

  const isLowerTier = (tier: string): boolean => {
    if (!currentSubscription) return false;
    return (
      getTierOrder(tier) < getTierOrder(currentSubscription.subscription_tier)
    );
  };

  const isHigherTier = (tier: string): boolean => {
    if (!currentSubscription) return false;
    return (
      getTierOrder(tier) > getTierOrder(currentSubscription.subscription_tier)
    );
  };

  const handleSubscribe = async (tier: "basic" | "advanced") => {
    try {
      setProcessingTier(tier);
      setError(null);

      // Get the current session to include auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Por favor, inicia sesión para suscribirte");
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      console.log("stripe response: ", data);

      if (!response.ok) {
        throw new Error(data.error || "No se pudo crear la sesión de pago");
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe no pudo cargar");
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      setError(error.message || "No se pudo iniciar el proceso de suscripción");
    } finally {
      setProcessingTier(null);
    }
  };

  const confirmSubscriptionChange = (tier: "basic" | "advanced") => {
    handleSubscribe(tier);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "freemium":
        return <Zap className="h-6 w-6" />;
      case "basic":
        return <Check className="h-6 w-6" />;
      case "advanced":
        return <Crown className="h-6 w-6" />;
      default:
        return <Zap className="h-6 w-6" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "freemium":
        return "text-gray-600";
      case "basic":
        return "text-blue-600";
      case "advanced":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const getTierPrice = (tier: string) => {
    switch (tier) {
      case "freemium":
        return "Gratis";
      case "basic":
        return "$9.99/mes";
      case "advanced":
        return "$29.99/mes";
      default:
        return "Gratis";
    }
  };

  const isCurrentTier = (tier: string) => {
    return (
      currentSubscription?.subscription_tier === tier &&
      currentSubscription?.is_active
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 border-b-2 border-primary mb-4"></div>
        <p className="text-lg font-medium text-muted-foreground">Obteniendo información...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Planes de Suscripción</h2>
        <p className="text-muted-foreground">
          Elige el plan que mejor se adapte a tus necesidades de análisis de documentos.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {benefits.map((benefit) => (
          <Card
            key={benefit.tier}
            className={`relative bg-white ${
              isCurrentTier(benefit.tier)
                ? "ring-2 ring-primary border-primary"
                : "border-border"
            }`}
          >
            {isCurrentTier(benefit.tier) && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary">
                Plan Actual
              </Badge>
            )}

            <CardHeader className="text-center pb-4">
              <div className={`mx-auto mb-4 ${getTierColor(benefit.tier)}`}>
                {getTierIcon(benefit.tier)}
              </div>
              <CardTitle className="text-xl capitalize">
                {benefit.tier}
              </CardTitle>
              <div className="text-3xl font-bold">
                {getTierPrice(benefit.tier)}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    {benefit.monthly_tokens} tokens/mes
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    {benefit.upload_limit
                      ? `${benefit.upload_limit} subidas de archivos`
                      : "Subidas de archivos ilimitadas"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    {benefit.human_review_access
                      ? "Acceso a revisión humana"
                      : "Revisión solo por IA"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm capitalize">
                    {benefit.support_prioritization} soporte
                  </span>
                </div>

                {benefit.token_purchase_discount > 0 && (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      {benefit.token_purchase_discount}% descuento en compras de tokens
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                {benefit.tier === "freemium" ? (
                  isCurrentTier(benefit.tier) ? (
                    <Button variant="outline" className="w-full" disabled>
                      Plan Actual
                    </Button>
                  ) : currentSubscription && !isCurrentTier(benefit.tier) ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          Cancelar Suscripción
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Cancelar Suscripción
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro de que quieres cancelar tu suscripción y bajar al plan Gratuito?
                            <br />
                            <br />
                            <strong>Perderás:</strong>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>
                                Tus tokens actuales de{" "}
                                {
                                  currentSubscription?.subscription_benefits
                                    .monthly_tokens
                                }{" "}
                                tokens/mes (reducidos a{" "}
                                {benefits.find((b) => b.tier === "freemium")
                                  ?.monthly_tokens || 50}{" "}
                                tokens/mes)
                              </li>
                              <li>
                                {currentSubscription?.subscription_benefits
                                  .human_review_access
                                  ? "Acceso a revisión humana"
                                  : ""}
                              </li>
                              <li>
                                {currentSubscription?.subscription_benefits
                                  .support_prioritization !== "no"
                                  ? `${currentSubscription?.subscription_benefits.support_prioritization} soporte (bajado a soporte estándar)`
                                  : ""}
                              </li>
                              {currentSubscription?.subscription_benefits
                                .token_purchase_discount > 0 && (
                                <li>
                                  {
                                    currentSubscription?.subscription_benefits
                                      .token_purchase_discount
                                  }
                                  % descuento en compras de tokens
                                </li>
                              )}
                              {!currentSubscription?.subscription_benefits
                                .upload_limit && (
                                <li>
                                  Subidas de archivos ilimitadas (limitadas a{" "}
                                  {benefits.find((b) => b.tier === "freemium")
                                    ?.upload_limit || 3}{" "}
                                  archivos)
                                </li>
                              )}
                            </ul>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            Mantener Suscripción
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancelSubscription}
                            disabled={cancellingSubscription}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {cancellingSubscription ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Cancelando...
                              </>
                            ) : (
                              "Sí, Cancelar Suscripción"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Plan Gratuito
                    </Button>
                  )
                ) : isCurrentTier(benefit.tier) ? (
                  <Button variant="outline" className="w-full" disabled>
                    Plan Actual
                  </Button>
                ) : isLowerTier(benefit.tier) ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full"
                        disabled={processingTier === benefit.tier}
                      >
                        {processingTier === benefit.tier ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          "Bajar Plan"
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Bajar Plan de Suscripción
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Vas a bajar tu suscripción de{" "}
                          <strong className="capitalize">
                            {currentSubscription?.subscription_tier}
                          </strong>{" "}
                          a{" "}
                          <strong className="capitalize">{benefit.tier}</strong>
                          .
                          <br />
                          <br />
                          <strong>Advertencia:</strong> Todos los beneficios actuales y tokens no utilizados se perderán y se resetearán a los límites del plan inferior. Perderás acceso a las funciones premium incluidas en tu plan actual.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Mantener Plan Actual</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            confirmSubscriptionChange(
                              benefit.tier as "basic" | "advanced",
                            )
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Confirmar Bajar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="w-full"
                        disabled={processingTier === benefit.tier}
                      >
                        {processingTier === benefit.tier ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Procesando...
                          </>
                        ) : (
                          "Suscribirse"
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Cambiar Plan de Suscripción
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {currentSubscription ? (
                            <>
                              Vas a cambiar tu suscripción de{" "}
                              <strong className="capitalize">
                                {currentSubscription.subscription_tier}
                              </strong>{" "}
                              a{" "}
                              <strong className="capitalize">
                                {benefit.tier}
                              </strong>
                              .
                              <br />
                              <br />
                              <strong>Importante:</strong> Todos los beneficios actuales y tokens no utilizados se perderán y se resetearán según tu nuevo plan. Este cambio tendrá efecto inmediatamente.
                            </>
                          ) : (
                            <>
                              Vas a suscribirte al{" "}
                              <strong className="capitalize">
                                {benefit.tier}
                              </strong>{" "}
                              plan. Tus beneficios y tokens se establecerán según este plan.
                            </>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            confirmSubscriptionChange(
                              benefit.tier as "basic" | "advanced",
                            )
                          }
                        >
                          Continuar con Suscripción
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Todas las suscripciones se cobran mensualmente y pueden cancelarse en cualquier momento. Los tokens se otorgan al inicio de cada ciclo de facturación.
        </p>
      </div>
    </div>
  );
}
