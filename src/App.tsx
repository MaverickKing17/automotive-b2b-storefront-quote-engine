import { useEffect, useState } from 'react';
import {
  clientConfig,
  getTierForQuantity,
  type CatalogProduct,
  type PolicyItem,
} from './data/clientConfig';
import {
  getProductBySkuForStorefront,
  STOREFRONTS,
  STOREFRONT_ORDER,
  type StorefrontId,
} from './data/storefronts';
import type {
  ContactDetails,
  DeploymentAnswers,
  PersistedQuoteState,
  SubmittedRfqRecord,
  VehicleGroup,
  VehicleSelection,
} from './types/quote';
import { StorefrontSwitcher } from './components/StorefrontSwitcher';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryShowcase } from './components/CategoryShowcase';
import { HardwareCatalog } from './components/HardwareCatalog';
import { ProcessSection } from './components/ProcessSection';
import { SpecAssistSection } from './components/SpecAssistSection';
import { PoliciesSection } from './components/PoliciesSection';
import { Footer } from './components/Footer';
import { ProductSpecsModal } from './components/ProductSpecsModal';
import { PolicyModal } from './components/PolicyModal';
import { QuoteDrawer } from './components/QuoteDrawer';

const getStorageKey = (storefrontId: StorefrontId) =>
  storefrontId === 'astrateq'
    ? 'astrateq_fleet_quote_v1'
    : `astrateq_fleet_quote_v1_${storefrontId}`;

const createInitialQuoteState = (storefrontId: StorefrontId): PersistedQuoteState => {
  const cfg = STOREFRONTS[storefrontId];
  return {
    lineItems: [],
    vehicleGroups: [],
    installationRequested: false,
    deployment: {
      installationPreference:
        storefrontId === 'truenorth' && cfg.upfitWorkflowOptions
          ? cfg.upfitWorkflowOptions.installationRequirements[0]
          : clientConfig.deploymentOptions.installationPreferences[0],
      fleetSize:
        storefrontId === 'northlink' && cfg.northlinkOptions
          ? cfg.northlinkOptions.fleetSizes[1]
          : storefrontId === 'voltdepot' && cfg.chargingOptions
            ? cfg.chargingOptions.fleetSizes[1]
            : clientConfig.deploymentOptions.fleetSizes[0],
      rolloutTimeline: clientConfig.deploymentOptions.rolloutTimelines[0],
      additionalEquipmentNotes: '',
      vehicleTypes: cfg.northlinkOptions?.vehicleTypes[0],
      trackingRequirements: cfg.northlinkOptions?.trackingRequirements[0],
      connectivityPreference: cfg.northlinkOptions?.connectivityPreferences[0],
      chargingType: cfg.chargingOptions?.chargingTypes[0],
      chargingBays: cfg.chargingOptions?.chargingBays[0],
      siteConditions: cfg.chargingOptions?.siteConditions[0],
      electricalService: cfg.chargingOptions?.electricalServices[0],
      siteLocation: cfg.chargingOptions?.regions[0],
      vehicleUse: cfg.upfitWorkflowOptions?.vehicleUses[0],
      requiredEquipment: cfg.upfitWorkflowOptions?.requiredEquipment[0],
      upfitLocation: cfg.upfitLocations?.[0],
    },
    contact: {
      fullName: '',
      companyName: '',
      workEmail: '',
      phone: '',
      provinceOrRegion: '',
      projectNotes: '',
    },
    currentStep: 1,
    submittedRecord: null,
  };
};

function isValidSubmittedRecord(record: unknown): record is SubmittedRfqRecord {
  if (!record || typeof record !== 'object') return false;
  const r = record as Partial<SubmittedRfqRecord>;
  return (
    (r.mode === 'backend-api' || r.mode === 'webhook') &&
    typeof r.idempotencyKey === 'string' &&
    typeof r.submittedAt === 'string' &&
    typeof r.deliveryStatus === 'string' &&
    typeof r.externalDeliveryConfigured === 'boolean' &&
    typeof r.payload === 'object' &&
    r.payload !== null
  );
}

function loadQuoteState(storefrontId: StorefrontId): PersistedQuoteState {
  try {
    const raw = window.localStorage.getItem(getStorageKey(storefrontId));
    const defaults = createInitialQuoteState(storefrontId);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<PersistedQuoteState>;
    const mergedDeployment = { ...defaults.deployment, ...(parsed.deployment ?? {}) };
    if (
      storefrontId === 'northlink' &&
      STOREFRONTS.northlink.northlinkOptions &&
      !STOREFRONTS.northlink.northlinkOptions.fleetSizes.includes(mergedDeployment.fleetSize)
    ) {
      mergedDeployment.fleetSize = defaults.deployment.fleetSize;
    }
    const validSkus = new Set(STOREFRONTS[storefrontId].products.map((p) => p.sku));
    const filteredLineItems = Array.isArray(parsed.lineItems)
      ? parsed.lineItems.filter(
          (item) =>
            item &&
            typeof item.sku === 'string' &&
            validSkus.has(item.sku) &&
            typeof item.quantity === 'number' &&
            item.quantity >= 1
        )
      : defaults.lineItems;
    const filteredVehicleGroups = Array.isArray(parsed.vehicleGroups)
      ? parsed.vehicleGroups.filter(
          (g) =>
            g &&
            typeof g.id === 'string' &&
            typeof g.year === 'string' &&
            typeof g.make === 'string' &&
            typeof g.model === 'string' &&
            typeof g.vehicleClass === 'string' &&
            typeof g.vehicleCount === 'number' &&
            g.vehicleCount >= 1
        )
      : defaults.vehicleGroups;
    return {
      lineItems: filteredLineItems,
      vehicleGroups: filteredVehicleGroups,
      installationRequested: Boolean(parsed.installationRequested),
      deployment: mergedDeployment,
      contact: { ...defaults.contact, ...(parsed.contact ?? {}) },
      currentStep:
        parsed.currentStep === 1 || parsed.currentStep === 2 || parsed.currentStep === 3
          ? parsed.currentStep
          : 1,
      submittedRecord: isValidSubmittedRecord(parsed.submittedRecord)
        ? parsed.submittedRecord
        : null,
    };
  } catch {
    return createInitialQuoteState(storefrontId);
  }
}

function getStorefrontFromLocation(): StorefrontId {
  try {
    const params = new URLSearchParams(window.location.search);
    const storeParam = params.get('store') as StorefrontId | null;
    if (storeParam && STOREFRONT_ORDER.includes(storeParam)) {
      return storeParam;
    }
    const hashValue = window.location.hash.replace(/^#\/?/, '').toLowerCase() as StorefrontId;
    if (hashValue && STOREFRONT_ORDER.includes(hashValue)) {
      return hashValue;
    }
  } catch {
    // Ignore URL parsing errors
  }
  return 'astrateq';
}

export default function App() {
  const [storefrontId, setStorefrontId] = useState<StorefrontId>(getStorefrontFromLocation);
  const [quoteState, setQuoteState] = useState<PersistedQuoteState>(() =>
    loadQuoteState(getStorefrontFromLocation())
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Hardware');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSpecsProduct, setActiveSpecsProduct] = useState<CatalogProduct | null>(null);
  const [activePolicy, setActivePolicy] = useState<PolicyItem | null>(null);

  const activeStorefront = STOREFRONTS[storefrontId];

  useEffect(() => {
    document.title = `${activeStorefront.brandName} — ${activeStorefront.roleTitle}`;
  }, [activeStorefront]);

  useEffect(() => {
    const handleLocationSync = () => {
      const nextId = getStorefrontFromLocation();
      setStorefrontId(nextId);
      setQuoteState(loadQuoteState(nextId));
      setSelectedCategory(STOREFRONTS[nextId].defaultCategory);
      setSearchQuery('');
    };
    window.addEventListener('popstate', handleLocationSync);
    window.addEventListener('hashchange', handleLocationSync);
    return () => {
      window.removeEventListener('popstate', handleLocationSync);
      window.removeEventListener('hashchange', handleLocationSync);
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(getStorageKey(storefrontId), JSON.stringify(quoteState));
    } catch {
      // Ignore storage quota errors
    }
  }, [quoteState, storefrontId]);

  const handleSelectStorefront = (nextId: StorefrontId) => {
    setStorefrontId(nextId);
    setQuoteState(loadQuoteState(nextId));
    setSelectedCategory(STOREFRONTS[nextId].defaultCategory);
    setSearchQuery('');
    setDrawerOpen(false);
    setActiveSpecsProduct(null);
    setActivePolicy(null);
    try {
      const url = new URL(window.location.href);
      url.hash = '';
      if (nextId === 'astrateq') {
        url.searchParams.delete('store');
      } else {
        url.searchParams.set('store', nextId);
      }
      window.history.pushState({}, '', url.toString());
    } catch {
      // Ignore history API issues
    }
  };

  const handleAddProduct = (sku: string) => {
    const product = getProductBySkuForStorefront(storefrontId, sku);
    if (!product) return;

    setQuoteState((prev) => {
      const existing = prev.lineItems.find((item) => item.sku === sku);
      if (existing) {
        const nextQty = existing.quantity + 1;
        const oldTier = getTierForQuantity(product, existing.quantity);
        const newTier = getTierForQuantity(product, nextQty);
        const tierChanged = oldTier.id !== newTier.id;

        return {
          ...prev,
          submittedRecord: null,
          lineItems: prev.lineItems.map((item) =>
            item.sku === sku
              ? {
                  ...item,
                  quantity: nextQty,
                  lastTierChangedFrom: tierChanged ? oldTier.label : item.lastTierChangedFrom,
                  lastTierChangedTo: tierChanged ? newTier.label : item.lastTierChangedTo,
                }
              : item
          ),
        };
      }

      return {
        ...prev,
        submittedRecord: null,
        lineItems: [...prev.lineItems, { sku, quantity: 1 }],
      };
    });

    setDrawerOpen(true);
  };

  const handleUpdateQuantity = (sku: string, nextQty: number) => {
    const product = getProductBySkuForStorefront(storefrontId, sku);
    if (!product) return;
    const safeQty = Math.max(1, Math.floor(nextQty) || 1);

    setQuoteState((prev) => ({
      ...prev,
      submittedRecord: null,
      lineItems: prev.lineItems.map((item) => {
        if (item.sku !== sku) return item;
        const oldTier = getTierForQuantity(product, item.quantity);
        const newTier = getTierForQuantity(product, safeQty);
        const tierChanged = oldTier.id !== newTier.id;
        return {
          ...item,
          quantity: safeQty,
          lastTierChangedFrom: tierChanged ? oldTier.label : item.lastTierChangedFrom,
          lastTierChangedTo: tierChanged ? newTier.label : item.lastTierChangedTo,
        };
      }),
    }));
  };

  const handleRemoveLineItem = (sku: string) => {
    setQuoteState((prev) => ({
      ...prev,
      submittedRecord: null,
      lineItems: prev.lineItems.filter((item) => item.sku !== sku),
    }));
  };

  const handleToggleInstallation = () => {
    setQuoteState((prev) => ({
      ...prev,
      submittedRecord: null,
      installationRequested: !prev.installationRequested,
    }));
  };

  const handleAttachVehicleGroup = (
    vehicle: VehicleSelection,
    addedFrom: 'finder' | 'manual',
    quantity = 1
  ) => {
    const safeCount = Math.max(1, Math.floor(quantity) || 1);
    const newGroup: VehicleGroup = {
      id: `vg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      groupLabel: '',
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      vehicleClass: vehicle.vehicleClass,
      vehicleCount: safeCount,
      powerSource: '',
      addedFrom,
    };

    setQuoteState((prev) => ({
      ...prev,
      submittedRecord: null,
      vehicleGroups: [...prev.vehicleGroups, newGroup],
    }));
  };

  const handleUpdateVehicleGroup = (id: string, patch: Partial<VehicleGroup>) => {
    setQuoteState((prev) => ({
      ...prev,
      submittedRecord: null,
      vehicleGroups: prev.vehicleGroups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }));
  };

  const handleRemoveVehicleGroup = (id: string) => {
    setQuoteState((prev) => ({
      ...prev,
      submittedRecord: null,
      vehicleGroups: prev.vehicleGroups.filter((g) => g.id !== id),
    }));
  };

  const handleUpdateDeployment = (patch: Partial<DeploymentAnswers>) => {
    setQuoteState((prev) => ({
      ...prev,
      deployment: { ...prev.deployment, ...patch },
    }));
  };

  const handleUpdateContact = (patch: Partial<ContactDetails>) => {
    setQuoteState((prev) => ({
      ...prev,
      contact: { ...prev.contact, ...patch },
    }));
  };

  const handleSetStep = (step: 1 | 2 | 3) => {
    setQuoteState((prev) => ({ ...prev, currentStep: step }));
  };

  const handleSetSubmittedRecord = (record: SubmittedRfqRecord | null) => {
    setQuoteState((prev) => ({ ...prev, submittedRecord: record }));
  };

  const handleResetQuote = () => {
    setQuoteState(createInitialQuoteState(storefrontId));
  };

  return (
    <div
      style={{
        backgroundColor: activeStorefront.theme.bgCanvas,
        color: activeStorefront.theme.textPrimary,
      }}
      className="min-h-screen flex flex-col transition-colors duration-200"
    >
      <StorefrontSwitcher activeId={storefrontId} onSelect={handleSelectStorefront} />

      <Header
        storefront={activeStorefront}
        lineItemCount={quoteState.lineItems.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectCategory={setSelectedCategory}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      <main className="flex-1">
        <HeroSection
          storefront={activeStorefront}
          deployment={quoteState.deployment}
          onUpdateDeployment={handleUpdateDeployment}
          onOpenDrawer={() => setDrawerOpen(true)}
          onSetStep={handleSetStep}
          onAttachVehicle={(vehicle, qty) => handleAttachVehicleGroup(vehicle, 'finder', qty)}
          onAddProduct={handleAddProduct}
          onSelectCategory={setSelectedCategory}
          attachedGroupCount={quoteState.vehicleGroups.length}
        />

        <CategoryShowcase
          storefront={activeStorefront}
          onSelectCategory={setSelectedCategory}
        />

        <HardwareCatalog
          storefrontId={activeStorefront.id}
          theme={activeStorefront.theme}
          products={activeStorefront.products}
          categories={activeStorefront.categories}
          demoNote={activeStorefront.demoNote}
          catalogKicker={activeStorefront.catalogKicker}
          catalogTitle={activeStorefront.catalogTitle}
          catalogSubtitle={activeStorefront.catalogSubtitle}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
          lineItems={quoteState.lineItems}
          vehicleGroups={quoteState.vehicleGroups}
          onAddToQuote={handleAddProduct}
          onViewSpecs={setActiveSpecsProduct}
        />

        <ProcessSection
          theme={activeStorefront.theme}
          steps={activeStorefront.processSteps}
        />

        <SpecAssistSection storefront={activeStorefront} />

        <PoliciesSection
          storefrontId={activeStorefront.id}
          theme={activeStorefront.theme}
          policies={activeStorefront.policies}
          contactInfo={activeStorefront.contactInfo}
          onOpenPolicy={setActivePolicy}
          onOpenDrawer={() => setDrawerOpen(true)}
        />
      </main>

      <Footer
        storefront={activeStorefront}
        onOpenDrawer={() => setDrawerOpen(true)}
        onSelectStorefront={handleSelectStorefront}
      />

      <ProductSpecsModal
        theme={activeStorefront.theme}
        product={activeSpecsProduct}
        vehicleGroups={quoteState.vehicleGroups}
        onClose={() => setActiveSpecsProduct(null)}
        onAddToQuote={handleAddProduct}
      />

      <PolicyModal
        theme={activeStorefront.theme}
        policy={activePolicy}
        onClose={() => setActivePolicy(null)}
      />

      <QuoteDrawer
        storefront={activeStorefront}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        quoteState={quoteState}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveLineItem={handleRemoveLineItem}
        onAddProduct={handleAddProduct}
        onToggleInstallation={handleToggleInstallation}
        onAddVehicleGroup={handleAttachVehicleGroup}
        onUpdateVehicleGroup={handleUpdateVehicleGroup}
        onRemoveVehicleGroup={handleRemoveVehicleGroup}
        onUpdateDeployment={handleUpdateDeployment}
        onUpdateContact={handleUpdateContact}
        onSetStep={handleSetStep}
        onSetSubmittedRecord={handleSetSubmittedRecord}
        onResetQuote={handleResetQuote}
        onOpenPolicy={setActivePolicy}
      />
    </div>
  );
}
