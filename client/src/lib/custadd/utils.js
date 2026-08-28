/**
 * API Configuration
 */
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL + '/cust' || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * API Helper Class
 */
export class AdminApiClient {
  constructor(baseUrl = API_CONFIG.baseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic API request handler with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...API_CONFIG.headers,
        ...options.headers,
      },
      credentials: 'include', // Include cookies for auth
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  /**
   * Create a new property
   */
  async createProperty(data) {
    return this.request('/admin/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Assign a service plan to a property
   */
  async assignServicePlan(data) {
    return this.request('/admin/service-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update property links
   */
  async updatePropertyLinks(data) {
    return this.request('/admin/property-links', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get plan change requests
   */
  async getPlanChangeRequests(status) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/admin/plan-change-requests${query}`);
  }

  /**
   * Approve a plan change request
   */
  async approvePlanChangeRequest(requestId, approvedBy) {
    return this.request('/admin/plan-change-requests/approve', {
      method: 'POST',
      body: JSON.stringify({
        request_id: requestId,
        approved_by: approvedBy,
      }),
    });
  }

  /**
   * Get dashboard stats
   */
  async getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }
}

/**
 * Validation Utilities
 */
export function validatePropertyForm(data) {
  const errors = [];

  if (!data.customer_id || data.customer_id.trim() === '') {
    errors.push({ field: 'customer_id', message: 'Customer ID is required' });
  }

  if (!data.property_id || data.property_id.trim() === '') {
    errors.push({ field: 'property_id', message: 'Property ID is required' });
  }

  if (!data.property_name || data.property_name.trim() === '') {
    errors.push({ field: 'property_name', message: 'Property name is required' });
  }

  if (!data.property_address || data.property_address.trim() === '') {
    errors.push({ field: 'property_address', message: 'Property address is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateServicePlanForm(data) {
  const errors = [];

  if (!data.customer_id) {
    errors.push({ field: 'customer_id', message: 'Customer ID is required' });
  }

  if (!data.property_id) {
    errors.push({ field: 'property_id', message: 'Property ID is required' });
  }

  if (!data.plan_name) {
    errors.push({ field: 'plan_name', message: 'Plan name is required' });
  }

  if (!data.service_type) {
    errors.push({ field: 'service_type', message: 'Service type is required' });
  }

  if (!data.shift_hours || Number(data.shift_hours) <= 0) {
    errors.push({ field: 'shift_hours', message: 'Valid shift hours required' });
  }

  if (!data.monthly_price || Number(data.monthly_price) <= 0) {
    errors.push({ field: 'monthly_price', message: 'Valid monthly price required' });
  }

  if (!data.start_date) {
    errors.push({ field: 'start_date', message: 'Start date is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function isValidUrl(url) {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format Utilities
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateString, options) {
  const date = new Date(dateString);
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleString('en-US', options || defaultOptions);
}

export function formatDateForInput(date = new Date()) {
  return date.toISOString().split('T')[0];
}

export function getTodayDate() {
  return formatDateForInput();
}

/**
 * Plan Templates
 */
export const PLAN_TEMPLATES = {
  dedicated8: {
    plan_name: 'Dedicated 8hr',
    service_type: 'DEDICATED',
    shift_hours: 8,
    monthly_price: 1800,
    onboarding_fee: 1500,
    installation_fee: 1500,
  },
  dedicated16: {
    plan_name: 'Dedicated 16hr',
    service_type: 'DEDICATED',
    shift_hours: 16,
    monthly_price: 2800,
    onboarding_fee: 1500,
    installation_fee: 1500,
  },
  dedicated24: {
    plan_name: 'Dedicated 24hr',
    service_type: 'DEDICATED',
    shift_hours: 24,
    monthly_price: 3800,
    onboarding_fee: 1500,
    installation_fee: 1500,
  },
  shared: {
    plan_name: 'Shared Plan',
    service_type: 'SHARED',
    shift_hours: 8,
    monthly_price: 1200,
    onboarding_fee: 1000,
    installation_fee: 1000,
  },
};