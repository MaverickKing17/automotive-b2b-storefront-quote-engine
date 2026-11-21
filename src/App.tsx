import { useEffect, useState } from 'react';
import {
  clientConfig,
  getProductBySku,
  getTierForQuantity,
  type CatalogProduct,
  type PolicyItem,
} from './data/clientConfig';
import type {
  ContactDetails,
  DeploymentAnswers,
  PersistedQuoteState,
  SubmittedRfqRecord,
  VehicleGroup,
  VehicleSelection,
} from './types/quote';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { HardwareCatalog } from './components/HardwareCatalog';
import { ProcessSection } from './components/ProcessSection';
import { SpecAssistSection } from './components/SpecAssistSection';
import { PoliciesSection } from './components/PoliciesSection';
import { Footer } from './components/Footer';
import { ProductSpecsModal } from './components/ProductSpecsModal';
import { PolicyModal } from './components/PolicyModal';
import { QuoteDrawer } from './components/QuoteDrawer';

const STORAGE_KEY = 'astrateq_fleet_quote_v1';

const createInitialQuoteState = (): PersistedQuoteState => ({
  lineItems: [],
  vehicleGroups: [],
  installationRequested: false,
  deployment: {
    installationPreference: clientConfig.deploymentOptions.installationPreferences[0],
    fleetSize: clientConfig.deploymentOptions.fleetSizes[0],
    rolloutTimeline: clientConfig.deploymentOptions.rolloutTimelines[0],
  },
  contact: {
    fullName: '',
    companyName: '',
    workEmail: '',
    phone: '',
  },
  currentStep: 1,
  submittedRecord: null,
});

function loadQuoteState(): PersistedQuoteState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialQuoteState();
    const parsed = JSON.parse(raw) as Partial<PersistedQuoteState>;
    const defaults = createInitialQuoteState();
    return {
      lineItems: Array.isArray(parsed.lineItems) ? parsed.lineItems : defaults.lineItems,
      vehicleGroups: Array.isArray(parsed.vehicleGroups)
        ? parsed.vehicleGroups
        : defaults.vehicleGroups,
      installationRequested: Boolean(parsed.installationRequested),
      deployment: { ...defaults.deployment, ...(parsed.deployment ?? {}) },
      contact: { ...defaults.contact, ...(parsed.contact ?? {}) },
      currentStep:
        parsed.currentStep === 1 || parsed.currentStep === 2 || parsed.currentStep === 3
          ? parsed.currentStep
          : 1,
      submittedRecord: parsed.submittedRecord ?? null,
    };
  } catch {
    return createInitialQuoteState();
  }
}

export default function App() {
  const [quoteState, setQuoteState] = useState<PersistedQuoteState>(loadQuoteState);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Hardware');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSpecsProduct, setActiveSpecsProduct] = useState<CatalogProduct | null>(null);
  const [activePolicy, setActivePolicy] = useState<PolicyItem | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(quoteState));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [quoteState]);

  const handleAddProduct = (sku: string) => {
    const product = getProductBySku(sku);
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
    const product = getProductBySku(sku);
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
    addedFrom: 'finder' | 'manual'
  ) => {
    const newGroup: VehicleGroup = {
      id: `vg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      vehicleClass: vehicle.vehicleClass,
      vehicleCount: 1,
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
    setQuoteState(createInitialQuoteState());
  };

  return (
    <div className="min-h-screen bg-[#171A1D] text-[#F2EFE9] flex flex-col">
      <Header
        lineItemCount={quoteState.lineItems.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectCategory={setSelectedCategory}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      <main className="flex-1">
        <HeroSection
          onOpenDrawer={() => setDrawerOpen(true)}
          onAttachVehicle={(vehicle) => handleAttachVehicleGroup(vehicle, 'finder')}
          onAddProduct={handleAddProduct}
          onSelectCategory={setSelectedCategory}
          attachedGroupCount={quoteState.vehicleGroups.length}
        />

        <HardwareCatalog
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
          lineItems={quoteState.lineItems}
          onAddToQuote={handleAddProduct}
          onViewSpecs={setActiveSpecsProduct}
        />

        <ProcessSection />

        <SpecAssistSection />

        <PoliciesSection onOpenPolicy={setActivePolicy} />
      </main>

      <Footer onOpenDrawer={() => setDrawerOpen(true)} />

      <ProductSpecsModal
        product={activeSpecsProduct}
        onClose={() => setActiveSpecsProduct(null)}
        onAddToQuote={handleAddProduct}
      />

      <PolicyModal policy={activePolicy} onClose={() => setActivePolicy(null)} />

      <QuoteDrawer
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
