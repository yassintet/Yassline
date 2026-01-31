"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { pointsAPI } from "@/lib/api";
import { authUtils } from "@/lib/auth";
import { 
  Gift, 
  Star, 
  Award,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Percent,
  Sparkles,
  Filter,
  TrendingUp,
  Zap,
  Package,
  XCircle
} from "lucide-react";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import { useI18n } from "@/lib/i18n/context";

export default function RecompensasPage() {
  const router = useRouter();
  const { t, language } = useI18n();
  const [rewards, setRewards] = useState<any[]>([]);
  const [myRewards, setMyRewards] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [membershipLevel, setMembershipLevel] = useState<string>('bronze');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!authUtils.isAuthenticated()) {
        router.push('/login');
        return;
      }

      // Verificar si es admin
      setIsAdmin(authUtils.isAdmin());

      const [pointsRes, rewardsRes, myRewardsRes] = await Promise.all([
        pointsAPI.getMy(),
        pointsAPI.getAvailableRewards(),
        pointsAPI.getMyRewards(),
      ]);

      if (pointsRes.success && pointsRes.data) {
        const pointsData = pointsRes.data as any;
        setUserPoints(pointsData.points);
        setMembershipLevel(pointsData.membershipLevel || 'bronze');
      }

      if (rewardsRes.success && rewardsRes.data) {
        setRewards(Array.isArray(rewardsRes.data) ? rewardsRes.data : []);
      }

      if (myRewardsRes.success && myRewardsRes.data) {
        setMyRewards(Array.isArray(myRewardsRes.data) ? myRewardsRes.data : []);
      }
    } catch (err: any) {
      console.error('Error cargando datos:', err);
      setError(err.message || t('rewards.error'));
    } finally {
      setLoading(false);
    }
  }, [router, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRedeem = async (rewardId: string) => {
    try {
      setRedeeming(rewardId);
      const response = await pointsAPI.redeemReward(rewardId);
      
      if (response.success) {
        // Recargar datos
        await loadData();
        alert(t('rewards.redeemSuccess'));
      } else {
        alert(response.error || t('rewards.redeemError'));
      }
    } catch (err: any) {
      console.error('Error canjeando recompensa:', err);
      alert(err.message || t('rewards.redeemError'));
    } finally {
      setRedeeming(null);
    }
  };

  const handleSeedRewards = async () => {
    if (!confirm(t('rewards.seedConfirm'))) {
      return;
    }

    try {
      setSeeding(true);
      const response = await pointsAPI.seedRewards();
      
      if (response.success) {
        alert(t('rewards.seedSuccess'));
        await loadData();
      } else {
        alert(response.error || t('rewards.seedError'));
      }
    } catch (err: any) {
      console.error('Error poblando recompensas:', err);
      alert(err.message || t('rewards.seedError'));
    } finally {
      setSeeding(false);
    }
  };

  const getRewardName = (reward: any) => {
    if (language === 'en') return reward.nameEn || reward.name;
    if (language === 'fr') return reward.nameFr || reward.name;
    return reward.nameEs || reward.name;
  };

  const getRewardDescription = (reward: any) => {
    if (language === 'en') return reward.descriptionEn || reward.description;
    if (language === 'fr') return reward.descriptionFr || reward.description;
    return reward.descriptionEs || reward.description;
  };

  const getMembershipColor = (level: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      bronze: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800' },
      silver: { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-800' },
      gold: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-800' },
      platinum: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-800' },
      diamante: { bg: 'bg-cyan-50', border: 'border-cyan-400', text: 'text-cyan-900' },
    };
    return colors[level] || colors.bronze;
  };

  const getRewardTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      discount: Percent,
      service: Gift,
      upgrade: TrendingUp,
      gift: Package,
    };
    return icons[type] || Gift;
  };

  const getRewardTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      discount: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },
      service: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
      upgrade: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
      gift: { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-700' },
    };
    return colors[type] || colors.gift;
  };

  // Filtrar recompensas por tipo
  const filteredRewards = filterType === 'all' 
    ? rewards 
    : rewards.filter(reward => reward.type === filterType);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--yass-cream)]">
        <Navbar />
        <div className="min-h-[calc(100vh-160px)] flex items-center justify-center pt-24 pb-12">
          <LoadingState message={t('rewards.loading')} fullScreen={false} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--yass-cream)]">
      <Navbar />

      <div className="min-h-[calc(100vh-160px)] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('rewards.title')}</h1>
                <p className="text-gray-600">
                  {t('rewards.subtitle')}
                </p>
              </div>
              {isAdmin && rewards.length === 0 && (
                <button
                  onClick={handleSeedRewards}
                  disabled={seeding}
                  className="px-6 py-3 bg-[var(--yass-gold)] text-white rounded-xl font-semibold hover:bg-[var(--yass-gold-light)] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {seeding ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t('rewards.seeding')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      {t('rewards.seedButton')}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Tarjeta de Puntos y Nivel */}
          <div className="mb-8 bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] rounded-xl shadow-lg p-6 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-full p-3">
                  <Star className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm opacity-90 mb-1">{t('rewards.yourPoints')}</p>
                  <p className="text-3xl font-bold">{userPoints.toLocaleString()} {t('rewards.points')}</p>
                  <p className="text-sm opacity-80 mt-1">≈ {(userPoints * 10).toLocaleString()} MAD</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-full p-3">
                  <Award className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm opacity-90 mb-1">{t('rewards.membershipLevel')}</p>
                  <p className="text-2xl font-bold capitalize">{t(`rewards.membership.${membershipLevel}`)}</p>
                </div>
              </div>
            </div>
            
            {/* Información sobre cómo ganar puntos */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm opacity-90 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {t('rewards.howToEarn')}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Recompensas Disponibles */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Gift className="h-6 w-6 text-[var(--yass-gold)]" />
                {t('rewards.available')}
              </h2>
              
              {/* Filtro por tipo */}
              {rewards.length > 0 && (
                <div className="flex items-center gap-3">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2.5 border-2 border-gray-300 rounded-xl bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[var(--yass-gold)] focus:border-[var(--yass-gold)] outline-none transition-all cursor-pointer hover:border-gray-400"
                  >
                    <option value="all">{t('rewards.filterAll')}</option>
                    <option value="discount">{t('rewards.filterDiscount')}</option>
                    <option value="service">{t('rewards.filterService')}</option>
                    <option value="upgrade">{t('rewards.filterUpgrade')}</option>
                    <option value="gift">{t('rewards.filterGift')}</option>
                  </select>
                </div>
              )}
            </div>
            
            {rewards.length === 0 ? (
              <EmptyState 
                icon="gift" 
                title={t('rewards.noRewards')} 
                message={t('rewards.noRewardsMessage')}
              />
            ) : filteredRewards.length === 0 ? (
              <EmptyState 
                icon="gift" 
                title={t('rewards.noRewardsFiltered')} 
                message={t('rewards.noRewardsFilteredMessage')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRewards.map((reward) => {
                  const canRedeem = userPoints >= reward.pointsRequired;
                  const pointsNeeded = reward.pointsRequired - userPoints;
                  const typeColors = getRewardTypeColor(reward.type);
                  const TypeIcon = getRewardTypeIcon(reward.type);
                  const madEquivalent = reward.pointsRequired * 10; // 10 MAD = 1 punto
                  
                  return (
                    <div
                      key={reward._id}
                      className={`bg-white rounded-xl shadow-md border-2 ${
                        canRedeem 
                          ? 'border-[var(--yass-gold)] hover:shadow-xl hover:scale-[1.02]' 
                          : 'border-gray-200 opacity-75'
                      } transition-all duration-300 overflow-hidden relative group`}
                    >
                      {/* Badge de tipo */}
                      <div className={`absolute top-4 right-4 ${typeColors.bg} ${typeColors.border} border-2 rounded-full p-2`}>
                        <TypeIcon className={`h-4 w-4 ${typeColors.text}`} />
                      </div>

                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 pr-12">
                            {getRewardName(reward)}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {getRewardDescription(reward)}
                          </p>
                          
                          {/* Información adicional según tipo */}
                          {reward.type === 'discount' && reward.discountPercent && (
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full text-sm font-semibold text-green-700 mb-2">
                              <Percent className="h-4 w-4" />
                              {reward.discountPercent}% {t('rewards.off')}
                            </div>
                          )}
                          {reward.type === 'discount' && reward.discountAmount && (
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full text-sm font-semibold text-green-700 mb-2">
                              {reward.discountAmount}€ {t('rewards.off')}
                            </div>
                          )}
                        </div>

                        {/* Información de puntos */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                              <span className="text-lg font-bold text-gray-900">
                                {reward.pointsRequired.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-600">{t('rewards.points')}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              ≈ {madEquivalent.toLocaleString()} MAD
                            </span>
                          </div>
                          
                          {/* Barra de progreso */}
                          {!canRedeem && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>{t('rewards.needMore')}</span>
                                <span className="font-semibold text-[var(--yass-gold)]">
                                  {pointsNeeded.toLocaleString()} {t('rewards.points')}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-[var(--yass-gold)] to-[var(--yass-gold-light)] h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min((userPoints / reward.pointsRequired) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleRedeem(reward._id)}
                          disabled={!canRedeem || redeeming === reward._id}
                          className={`w-full py-3 rounded-xl font-semibold transition-all ${
                            canRedeem
                              ? 'bg-[var(--yass-gold)] text-white hover:bg-[var(--yass-gold-light)] hover:shadow-lg transform hover:scale-[1.02]'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          } flex items-center justify-center gap-2`}
                        >
                          {redeeming === reward._id ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              {t('rewards.redeeming')}
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-5 w-5" />
                              {canRedeem ? t('rewards.redeem') : t('rewards.insufficientPoints')}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mis Recompensas Canjeadas */}
          {myRewards.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-6 w-6 text-[var(--yass-gold)]" />
                {t('rewards.myRewards')}
                <span className="text-lg font-normal text-gray-500 ml-2">
                  ({myRewards.length})
                </span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRewards.map((myReward, index) => {
                  const reward = myReward.rewardId;
                  if (!reward) return null;
                  
                  const typeColors = getRewardTypeColor(reward.type);
                  const TypeIcon = getRewardTypeIcon(reward.type);
                  
                  return (
                    <div
                      key={index}
                      className={`bg-white rounded-xl shadow-md border-2 ${
                        myReward.used 
                          ? 'border-gray-200 opacity-60' 
                          : 'border-green-300 hover:shadow-lg'
                      } transition-all duration-300 overflow-hidden relative`}
                    >
                      {/* Badge de tipo */}
                      <div className={`absolute top-4 right-4 ${typeColors.bg} ${typeColors.border} border-2 rounded-full p-2`}>
                        <TypeIcon className={`h-4 w-4 ${typeColors.text}`} />
                      </div>

                      <div className="p-6">
                        <div className="mb-4 pr-12">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {getRewardName(reward)}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {getRewardDescription(reward)}
                          </p>
                          
                          {/* Información de descuento si aplica */}
                          {reward.type === 'discount' && reward.discountPercent && (
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full text-sm font-semibold text-green-700 mb-2">
                              <Percent className="h-4 w-4" />
                              {reward.discountPercent}% {t('rewards.off')}
                            </div>
                          )}
                          {reward.type === 'discount' && reward.discountAmount && (
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 rounded-full text-sm font-semibold text-green-700 mb-2">
                              {reward.discountAmount}€ {t('rewards.off')}
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-500 mt-2">
                            {t('rewards.redeemedOn')} {new Date(myReward.redeemedAt).toLocaleDateString(
                              language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-ES',
                              { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }
                            )}
                          </p>
                        </div>

                        {myReward.used ? (
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <span className="text-sm font-semibold text-gray-500 flex items-center justify-center gap-2">
                              <XCircle className="h-4 w-4" />
                              {t('rewards.used')}
                            </span>
                          </div>
                        ) : (
                          <div className="bg-green-50 rounded-lg p-3 text-center border-2 border-green-200">
                            <span className="text-sm font-semibold text-green-700 flex items-center justify-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              {t('rewards.available')}
                            </span>
                            <p className="text-xs text-green-600 mt-1">
                              {t('rewards.canUse')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
