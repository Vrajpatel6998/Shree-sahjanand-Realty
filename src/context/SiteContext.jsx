import { createContext, useContext, useState, useEffect } from 'react';
import { siteInfo as staticSiteInfo, services as staticServices } from '../data/siteData';
import {
  FiHome,
  FiBriefcase,
  FiActivity,
  FiMap,
  FiDollarSign,
  FiLayers
} from 'react-icons/fi';

const SiteContext = createContext(null);

const staticServiceMetadata = {
  residential: { icon: FiHome, color: "#1a3c8e", gradient: "linear-gradient(135deg, #1a3c8e, #00b4d8)" },
  commercial: { icon: FiBriefcase, color: "#00b4d8", gradient: "linear-gradient(135deg, #00b4d8, #48cae4)" },
  industrial: { icon: FiActivity, color: "#0d1b4b", gradient: "linear-gradient(135deg, #0d1b4b, #1a3c8e)" },
  land: { icon: FiMap, color: "#2d7a4f", gradient: "linear-gradient(135deg, #2d7a4f, #48cae4)" },
  loans: { icon: FiDollarSign, color: "#c9a84c", gradient: "linear-gradient(135deg, #c9a84c, #f0d98c)" },
  interior: { icon: FiLayers, color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6, #00b4d8)" }
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};

export const SiteProvider = ({ children }) => {
  const [siteInfo, setSiteInfo] = useState(staticSiteInfo);
  const [services, setServices] = useState(staticServices);
  const [loading, setLoading] = useState(true);

  const fetchSiteData = async () => {
    try {
      const [settingsRes, servicesRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/services')
      ]);

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        // Merge settingsData with fallback static values
        setSiteInfo(prev => ({
          ...prev,
          ...settingsData,
          social: {
            ...prev.social,
            ...(settingsData.social || {})
          }
        }));
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        if (servicesData && servicesData.length > 0) {
          const mergedServices = servicesData.map(s => {
            const metadata = staticServiceMetadata[s.id] || {};
            return {
              ...s,
              icon: metadata.icon || FiHome,
              color: metadata.color || "#1a3c8e",
              gradient: metadata.gradient || "linear-gradient(135deg, #1a3c8e, #00b4d8)"
            };
          });
          setServices(mergedServices);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch dynamic site info, using fallback data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiteData();
  }, []);

  return (
    <SiteContext.Provider value={{ siteInfo, services, loading, refreshSiteData: fetchSiteData }}>
      {children}
    </SiteContext.Provider>
  );
};
