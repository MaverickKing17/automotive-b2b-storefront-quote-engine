import {
  EmailDeliveryTimeoutError,
  getEmailRoutingConfig,
  sendRfqEmail,
  STOREFRONT_ROUTING_MAP,
  type StorefrontRoutingMeta,
} from './rfqEmail';
import {
  computeCanonicalPayloadHash,
  findRfqByIdempotencyKey,
  generateUniqueQuoteId,
  getStorageBackendInfo,
  saveRfqEntry,
  withIdempotencyLock,
  type PersistedEmailDeliveryMeta,
  type PersistedRfqEntry,
} from './rfqStore';

export type RfqOutcomeCode =
  | 'RFQ_SUBMITTED'
  | 'DUPLICATE_REPLAY'
  | 'VALIDATION_ERROR'
  | 'IDEMPOTENCY_CONFLICT'
  | 'CONFIGURATION_ERROR'
  | 'PROVIDER_ERROR'
  | 'PROVIDER_TIMEOUT';

export interface RfqProcessResult {
  httpStatus: number;
  body: Record<string, unknown>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IDEMPOTENCY_KEY_RE = /^[A-Za-z0-9._:-]{8,128}$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readBoundedString(
  value: unknown,
  field: string,
  opts: { required?: boolean; min?: number; max: number },
  fieldErrors: Record<string, string>
): string {
  if (value === undefined || value === null) {
    if (opts.required) {
      fieldErrors[field] = `${field} is required.`;
    }
    return '';
  }
  if (typeof value !== 'string') {
    fieldErrors[field] = `${field} must be a string.`;
    return '';
  }
  const trimmed = value.trim();
  if (opts.required && trimmed.length === 0) {
    fieldErrors[field] = `${field} is required.`;
    return '';
  }
  if (opts.min && trimmed.length > 0 && trimmed.length < opts.min) {
    fieldErrors[field] = `${field} must be at least ${opts.min} characters.`;
    return '';
  }
  if (trimmed.length > opts.max) {
    fieldErrors[field] = `${field} must be ${opts.max} characters or fewer.`;
    return '';
  }
  return trimmed;
}

function resolveStorefrontFromBody(
  body: Record<string, unknown>,
  fieldErrors: Record<string, string>
): StorefrontRoutingMeta | null {
  const rawId = typeof body.storefrontId === 'string' ? body.storefrontId.trim().toLowerCase() : '';
  const rawCode =
    typeof body.storefrontCode === 'string' ? body.storefrontCode.trim().toUpperCase() : '';

  if (!rawId && !rawCode) {
    fieldErrors.storefrontCode = 'storefrontCode or storefrontId is required.';
    return null;
  }

  let matchedById: StorefrontRoutingMeta | undefined;
  if (rawId) {
    matchedById = STOREFRONT_ROUTING_MAP[rawId];
    if (!matchedById) {
      fieldErrors.storefrontId = 'Unsupported storefrontId.';
      return null;
    }
  }

  let matchedByCode: StorefrontRoutingMeta | undefined;
  if (rawCode) {
    matchedByCode = Object.values(STOREFRONT_ROUTING_MAP).find((m) => m.code === rawCode);
    if (!matchedByCode) {
      fieldErrors.storefrontCode = 'Unsupported storefrontCode.';
      return null;
    }
  }

  if (matchedById && matchedByCode && matchedById.id !== matchedByCode.id) {
    fieldErrors.storefrontCode = 'storefrontCode does not match storefrontId.';
    return null;
  }

  return matchedByCode || matchedById || null;
}

export async function processRfqSubmission(rawBody: unknown): Promise<RfqProcessResult> {
  if (!isPlainObject(rawBody)) {
    return {
      httpStatus: 400,
      body: {
        ok: false,
        code: 'VALIDATION_ERROR' satisfies RfqOutcomeCode,
        error: 'Request body must be a JSON object.',
      },
    };
  }

  const fieldErrors: Record<string, string> = {};

  const idempotencyKey = readBoundedString(
    rawBody.idempotencyKey,
    'idempotencyKey',
    { required: true, min: 8, max: 128 },
    fieldErrors
  );
  if (idempotencyKey && !IDEMPOTENCY_KEY_RE.test(idempotencyKey)) {
    fieldErrors.idempotencyKey =
      'idempotencyKey must contain only letters, numbers, dots, underscores, colons, or hyphens (8-128 chars).';
  }

  const storefrontMeta = resolveStorefrontFromBody(rawBody, fieldErrors);

  if (rawBody.brand !== undefined) {
    readBoundedString(rawBody.brand, 'brand', { required: true, max: 120 }, fieldErrors);
  }

  // Validate hardware line items
  if (rawBody.hardwareLines !== undefined && !Array.isArray(rawBody.hardwareLines)) {
    fieldErrors.hardwareLines = 'hardwareLines must be an array.';
  }
  const rawLines = Array.isArray(rawBody.hardwareLines) ? rawBody.hardwareLines : [];
  if (rawLines.length > 50) {
    fieldErrors.hardwareLines = 'A maximum of 50 hardware line items is supported per RFQ.';
  }

  const sanitizedLines: Array<Record<string, unknown>> = [];
  rawLines.forEach((line, idx) => {
    if (!isPlainObject(line)) {
      fieldErrors[`hardwareLines.${idx}`] = 'Each hardware line item must be an object.';
      return;
    }
    const sku = readBoundedString(
      line.sku,
      `hardwareLines.${idx}.sku`,
      { required: true, max: 64 },
      fieldErrors
    );
    const qty = line.quantity;
    if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1 || qty > 100000) {
      fieldErrors[`hardwareLines.${idx}.quantity`] =
        'Line item quantity must be a whole number between 1 and 100,000.';
    }

    const name = readBoundedString(
      line.name,
      `hardwareLines.${idx}.name`,
      { max: 200 },
      fieldErrors
    );
    const category = readBoundedString(
      line.category,
      `hardwareLines.${idx}.category`,
      { max: 100 },
      fieldErrors
    );
    const unitLabel = readBoundedString(
      line.unitLabel,
      `hardwareLines.${idx}.unitLabel`,
      { max: 40 },
      fieldErrors
    );
    const activeTier = readBoundedString(
      line.activeTier,
      `hardwareLines.${idx}.activeTier`,
      { max: 80 },
      fieldErrors
    );
    const pricingNote = readBoundedString(
      line.pricingNote,
      `hardwareLines.${idx}.pricingNote`,
      { max: 200 },
      fieldErrors
    );

    const unitPriceCad =
      line.unitPriceCad === null || line.unitPriceCad === undefined
        ? null
        : typeof line.unitPriceCad === 'number' && Number.isFinite(line.unitPriceCad) && line.unitPriceCad >= 0
          ? line.unitPriceCad
          : (fieldErrors[`hardwareLines.${idx}.unitPriceCad`] = 'unitPriceCad must be a non-negative number or null.',
            null);

    const lineTotalCad =
      line.lineTotalCad === null || line.lineTotalCad === undefined
        ? null
        : typeof line.lineTotalCad === 'number' && Number.isFinite(line.lineTotalCad) && line.lineTotalCad >= 0
          ? line.lineTotalCad
          : (fieldErrors[`hardwareLines.${idx}.lineTotalCad`] = 'lineTotalCad must be a non-negative number or null.',
            null);

    sanitizedLines.push({
      sku,
      ...(name ? { name } : {}),
      ...(category ? { category } : {}),
      quantity: qty,
      ...(unitLabel ? { unitLabel } : {}),
      ...(activeTier ? { activeTier } : {}),
      unitPriceCad,
      lineTotalCad,
      ...(pricingNote ? { pricingNote } : {}),
    });
  });

  // Validate vehicle groups
  if (rawBody.vehicleGroups !== undefined && !Array.isArray(rawBody.vehicleGroups)) {
    fieldErrors.vehicleGroups = 'vehicleGroups must be an array.';
  }
  const rawGroups = Array.isArray(rawBody.vehicleGroups) ? rawBody.vehicleGroups : [];
  if (rawGroups.length > 50) {
    fieldErrors.vehicleGroups = 'A maximum of 50 vehicle groups is supported per RFQ.';
  }

  const sanitizedGroups: Array<Record<string, unknown>> = [];
  rawGroups.forEach((grp, idx) => {
    if (!isPlainObject(grp)) {
      fieldErrors[`vehicleGroups.${idx}`] = 'Each vehicle group must be an object.';
      return;
    }
    const year = readBoundedString(
      grp.year,
      `vehicleGroups.${idx}.year`,
      { required: true, max: 20 },
      fieldErrors
    );
    const make = readBoundedString(
      grp.make,
      `vehicleGroups.${idx}.make`,
      { required: true, max: 60 },
      fieldErrors
    );
    const model = readBoundedString(
      grp.model,
      `vehicleGroups.${idx}.model`,
      { required: true, max: 80 },
      fieldErrors
    );
    const vehicleClass = readBoundedString(
      grp.vehicleClass,
      `vehicleGroups.${idx}.vehicleClass`,
      { required: true, max: 60 },
      fieldErrors
    );
    const powerSource = readBoundedString(
      grp.powerSource,
      `vehicleGroups.${idx}.powerSource`,
      { required: true, max: 40 },
      fieldErrors
    );
    const vehicleCount = grp.vehicleCount;
    if (
      typeof vehicleCount !== 'number' ||
      !Number.isInteger(vehicleCount) ||
      vehicleCount < 1 ||
      vehicleCount > 100000
    ) {
      fieldErrors[`vehicleGroups.${idx}.vehicleCount`] =
        'vehicleCount must be a whole number between 1 and 100,000.';
    }
    const groupLabel = readBoundedString(
      grp.groupLabel,
      `vehicleGroups.${idx}.groupLabel`,
      { max: 100 },
      fieldErrors
    );
    const fitmentStatus = readBoundedString(
      grp.fitmentStatus,
      `vehicleGroups.${idx}.fitmentStatus`,
      { max: 40 },
      fieldErrors
    );
    const fitmentLabel = readBoundedString(
      grp.fitmentLabel,
      `vehicleGroups.${idx}.fitmentLabel`,
      { max: 120 },
      fieldErrors
    );
    const id = readBoundedString(grp.id, `vehicleGroups.${idx}.id`, { max: 80 }, fieldErrors);

    sanitizedGroups.push({
      ...(id ? { id } : {}),
      ...(groupLabel ? { groupLabel } : {}),
      year,
      make,
      model,
      vehicleClass,
      vehicleCount,
      powerSource,
      ...(fitmentStatus ? { fitmentStatus } : {}),
      ...(fitmentLabel ? { fitmentLabel } : {}),
    });
  });

  const installationCoordinationRequested = Boolean(rawBody.installationCoordinationRequested);
  if (
    sanitizedLines.length === 0 &&
    sanitizedGroups.length === 0 &&
    !installationCoordinationRequested
  ) {
    fieldErrors.rfqScope =
      'Include at least one hardware item, vehicle group, or installation coordination request.';
  }

  // Validate deployment object
  const sanitizedDeployment: Record<string, string> = {};
  if (!isPlainObject(rawBody.deployment)) {
    fieldErrors.deployment = 'Deployment details object is required.';
  } else {
    const dep = rawBody.deployment;
    sanitizedDeployment.installationPreference = readBoundedString(
      dep.installationPreference,
      'deployment.installationPreference',
      { required: true, max: 160 },
      fieldErrors
    );
    sanitizedDeployment.fleetSize = readBoundedString(
      dep.fleetSize,
      'deployment.fleetSize',
      { required: true, max: 100 },
      fieldErrors
    );
    sanitizedDeployment.rolloutTimeline = readBoundedString(
      dep.rolloutTimeline,
      'deployment.rolloutTimeline',
      { required: true, max: 100 },
      fieldErrors
    );

    const optionalDeploymentKeys = [
      'vehicleTypes',
      'trackingRequirements',
      'connectivityPreference',
      'chargingType',
      'chargingBays',
      'siteConditions',
      'electricalService',
      'siteLocation',
      'vehicleUse',
      'requiredEquipment',
      'upfitLocation',
    ] as const;

    for (const key of optionalDeploymentKeys) {
      const val = readBoundedString(dep[key], `deployment.${key}`, { max: 200 }, fieldErrors);
      if (val) sanitizedDeployment[key] = val;
    }

    const additionalEquipmentNotes = readBoundedString(
      dep.additionalEquipmentNotes,
      'deployment.additionalEquipmentNotes',
      { max: 2000 },
      fieldErrors
    );
    if (additionalEquipmentNotes) {
      sanitizedDeployment.additionalEquipmentNotes = additionalEquipmentNotes;
    }
  }

  // Validate contact object & project notes
  const sanitizedContact: Record<string, string> = {};
  if (!isPlainObject(rawBody.contact)) {
    fieldErrors.contact = 'Procurement contact details are required.';
  } else {
    const c = rawBody.contact;
    sanitizedContact.fullName = readBoundedString(
      c.fullName,
      'contact.fullName',
      { required: true, min: 2, max: 120 },
      fieldErrors
    );
    sanitizedContact.companyName = readBoundedString(
      c.companyName,
      'contact.companyName',
      { required: true, min: 1, max: 160 },
      fieldErrors
    );
    const workEmail = readBoundedString(
      c.workEmail,
      'contact.workEmail',
      { required: true, max: 254 },
      fieldErrors
    );
    if (workEmail && !EMAIL_RE.test(workEmail)) {
      fieldErrors['contact.workEmail'] = 'A valid business email address is required.';
    } else {
      sanitizedContact.workEmail = workEmail;
    }

    const phone = readBoundedString(
      c.phone,
      'contact.phone',
      { required: true, max: 40 },
      fieldErrors
    );
    const digits = phone.replace(/\D/g, '').length;
    if (phone && (digits < 7 || digits > 20)) {
      fieldErrors['contact.phone'] =
        'A valid contact telephone number (7 to 20 digits) is required.';
    } else {
      sanitizedContact.phone = phone;
    }

    const provinceOrRegion = readBoundedString(
      c.provinceOrRegion,
      'contact.provinceOrRegion',
      { max: 120 },
      fieldErrors
    );
    if (provinceOrRegion) {
      sanitizedContact.provinceOrRegion = provinceOrRegion;
    }

    const projectNotes = readBoundedString(
      c.projectNotes,
      'contact.projectNotes',
      { max: 3000 },
      fieldErrors
    );
    if (projectNotes) {
      sanitizedContact.projectNotes = projectNotes;
    }
  }

  const errorKeys = Object.keys(fieldErrors);
  if (errorKeys.length > 0 || !storefrontMeta) {
    const firstMessage =
      fieldErrors[errorKeys[0]] || 'Invalid RFQ submission payload.';
    return {
      httpStatus: 400,
      body: {
        ok: false,
        code: 'VALIDATION_ERROR' satisfies RfqOutcomeCode,
        error: firstMessage,
        fieldErrors,
      },
    };
  }

  // Canonical semantic payload (never includes client-supplied recipient overrides or volatile timestamps)
  const canonicalPayload: Record<string, unknown> = {
    currency: 'CAD',
    storefrontId: storefrontMeta.id,
    storefrontCode: storefrontMeta.code,
    brand: storefrontMeta.brand,
    hardwareLines: sanitizedLines,
    installationCoordinationRequested,
    vehicleGroups: sanitizedGroups,
    deployment: sanitizedDeployment,
    contact: sanitizedContact,
  };

  const payloadHash = computeCanonicalPayloadHash(canonicalPayload);
  const storageInfo = getStorageBackendInfo();

  return withIdempotencyLock(idempotencyKey, async () => {
    const existing = await findRfqByIdempotencyKey(idempotencyKey).catch(() => null);

    if (existing) {
      if (existing.payloadHash !== payloadHash) {
        return {
          httpStatus: 409,
          body: {
            ok: false,
            code: 'IDEMPOTENCY_CONFLICT' satisfies RfqOutcomeCode,
            error:
              'This idempotencyKey was already used for a different RFQ payload. Modify the key or start a new quote.',
          },
        };
      }

      if (existing.status === 'delivered' && existing.emailDelivery?.delivered) {
        return {
          httpStatus: 200,
          body: {
            ok: true,
            code: 'DUPLICATE_REPLAY' satisfies RfqOutcomeCode,
            deduplicated: true,
            quoteId: existing.quoteId,
            persistedAt: existing.persistedAt,
            status: existing.status,
            storageBackend: storageInfo.backend,
            storageDurable: storageInfo.durable,
            externalDeliveryConfigured: true,
            emailDelivery: existing.emailDelivery,
            record: existing,
          },
        };
      }
    }

    const quoteId = existing?.quoteId || (await generateUniqueQuoteId(storefrontMeta.code));
    const persistedAt = existing?.persistedAt || new Date().toISOString();
    const storedPayload: Record<string, unknown> = {
      ...canonicalPayload,
      idempotencyKey,
      quoteId,
      persistedAt,
    };

    const emailConfig = getEmailRoutingConfig(storefrontMeta.id);

    if (!emailConfig.configured) {
      const configErrorMessage = `RFQ email routing is not configured. Missing: ${emailConfig.missingConfig.join(', ')}.`;
      const emailDeliveryMeta: PersistedEmailDeliveryMeta = {
        configured: false,
        attempted: false,
        delivered: false,
        error: configErrorMessage,
        missingConfig: emailConfig.missingConfig,
      };
      const entry: PersistedRfqEntry = {
        quoteId,
        idempotencyKey,
        payloadHash,
        storefrontId: storefrontMeta.id,
        storefrontCode: storefrontMeta.code,
        brand: storefrontMeta.brand,
        status: 'configuration_error',
        persistedAt,
        updatedAt: new Date().toISOString(),
        emailDelivery: emailDeliveryMeta,
        payload: storedPayload,
      };
      const recordPreserved = await saveRfqEntry(entry).catch(() => false);

      return {
        httpStatus: 503,
        body: {
          ok: false,
          code: 'CONFIGURATION_ERROR' satisfies RfqOutcomeCode,
          error: configErrorMessage,
          missingConfig: emailConfig.missingConfig,
          quoteId: recordPreserved ? quoteId : undefined,
          recordPreserved,
          storageBackend: storageInfo.backend,
          storageDurable: storageInfo.durable,
          emailDelivery: emailDeliveryMeta,
        },
      };
    }

    try {
      const delivery = await sendRfqEmail(
        {
          quoteId,
          storefrontId: storefrontMeta.id,
          brand: storefrontMeta.brand,
          persistedAt,
          payload: storedPayload,
        },
        emailConfig
      );

      if (!delivery.delivered) {
        throw new Error('Email provider did not confirm acceptance.');
      }

      const emailDeliveryMeta: PersistedEmailDeliveryMeta = {
        configured: true,
        attempted: true,
        delivered: true,
        provider: delivery.provider,
        recipientMasked: delivery.recipientMasked,
        messageId: delivery.messageId,
        sentAt: delivery.sentAt,
      };

      const entry: PersistedRfqEntry = {
        quoteId,
        idempotencyKey,
        payloadHash,
        storefrontId: storefrontMeta.id,
        storefrontCode: storefrontMeta.code,
        brand: storefrontMeta.brand,
        status: 'delivered',
        persistedAt,
        updatedAt: new Date().toISOString(),
        emailDelivery: emailDeliveryMeta,
        payload: storedPayload,
      };

      await saveRfqEntry(entry).catch(() => false);

      return {
        httpStatus: 201,
        body: {
          ok: true,
          code: 'RFQ_SUBMITTED' satisfies RfqOutcomeCode,
          deduplicated: false,
          quoteId,
          persistedAt,
          status: entry.status,
          storageBackend: storageInfo.backend,
          storageDurable: storageInfo.durable,
          externalDeliveryConfigured: true,
          emailDelivery: emailDeliveryMeta,
          record: entry,
        },
      };
    } catch (err) {
      const isTimeout = err instanceof EmailDeliveryTimeoutError;
      const msg = err instanceof Error ? err.message : 'Unknown email provider error.';
      const emailDeliveryMeta: PersistedEmailDeliveryMeta = {
        configured: true,
        attempted: true,
        delivered: false,
        error: msg,
      };

      const entry: PersistedRfqEntry = {
        quoteId,
        idempotencyKey,
        payloadHash,
        storefrontId: storefrontMeta.id,
        storefrontCode: storefrontMeta.code,
        brand: storefrontMeta.brand,
        status: 'delivery_failed',
        persistedAt,
        updatedAt: new Date().toISOString(),
        emailDelivery: emailDeliveryMeta,
        payload: storedPayload,
      };
      const recordPreserved = await saveRfqEntry(entry).catch(() => false);

      return {
        httpStatus: isTimeout ? 504 : 502,
        body: {
          ok: false,
          code: (isTimeout ? 'PROVIDER_TIMEOUT' : 'PROVIDER_ERROR') satisfies RfqOutcomeCode,
          error: `RFQ email delivery failed: ${msg}`,
          quoteId: recordPreserved ? quoteId : undefined,
          recordPreserved,
          storageBackend: storageInfo.backend,
          storageDurable: storageInfo.durable,
          emailDelivery: emailDeliveryMeta,
        },
      };
    }
  });
}
