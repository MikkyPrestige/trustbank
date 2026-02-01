export type SystemSettingSchema = {
  label: string;
  type: 'BOOLEAN' | 'NUMBER' | 'TEXT';
  group: 'security' | 'limits' | 'features' | 'system';
  description?: string;
  defaultValue: string;
};

// This is the Master List of all dynamic rules in your bank
export const SYSTEM_DEFINITIONS: Record<string, SystemSettingSchema> = {
  // --- SECURITY ---
security_lockout_duration: {
    label: "IP Block Duration (Minutes)",
    type: "NUMBER",
    group: "security",
    defaultValue: "15",
    description: "How long an IP address is banned after hitting the rate limit."
  },
  security_max_attempts: {
    label: "IP Rate Limit (Temp Block)",
    type: "NUMBER",
    group: "security",
    defaultValue: "5",
    description: "Failed tries allowed from one IP before it is temporarily blocked."
  },
  auth_login_limit: {
    label: "Account Lockout Threshold (Hard Lock)",
    description: "Total failed tries allowed before the User Account is FROZEN.",
    type: "NUMBER",
    group: "security",
    defaultValue: "5"
  },

  // --- FINANCIAL LIMITS ---
  limit_unverified_tx_max: {
    label: "Unverified Max Transaction ($)",
    type: "NUMBER",
    group: "limits",
    defaultValue: "2000"
  },
  limit_unverified_daily_max: {
    label: "Unverified Daily Max ($)",
    type: "NUMBER",
    group: "limits",
    defaultValue: "10000"
  },

  // --- FEATURE FLAGS ---
  feature_register_enabled: {
    label: "Enable User Registration",
    type: "BOOLEAN",
    group: "features",
    defaultValue: "true",
    description: "Allow new users to create accounts. Turn off to stop signups."
  },
  feature_transfer_enabled: {
    label: "Enable Internal Transfers",
    type: "BOOLEAN",
    group: "features",
    defaultValue: "true",
    description: "Allow users to send money to other users."
  },
  feature_wire_enabled: {
    label: "Enable Wire Transfers",
    type: "BOOLEAN",
    group: "features",
    defaultValue: "true",
    description: "Allow external transfers (SWIFT/ACH)."
  },

feature_loan_apply_enabled: {
    label: "Enable Loan Applications",
    type: "BOOLEAN",
    group: "features",
    defaultValue: "true",
    description: "Allow users to request new loans."
  },
  feature_loan_repay_enabled: {
    label: "Enable Loan Repayments",
    type: "BOOLEAN",
    group: "features",
    defaultValue: "true",
    description: "Allow users to pay back existing loans."
  },

  feature_crypto_enabled: {
    label: "Enable Crypto Trading",
    type: "BOOLEAN",
    group: "features",
    defaultValue: "true",
    description: "Allow buying and selling of assets."
  },
  feature_crypto_transfer_enabled: {
    label: "Enable Crypto Transfers",
    type: "BOOLEAN",
    group: "features",
    defaultValue: "true",
    description: "Allow users to send crypto to external wallets."
  },
  feature_wallet_gen_enabled: {
    label: "Enable Wallet Generation",
    type: "BOOLEAN",
    group: "features",
    defaultValue: "true",
    description: "Allow users to create new crypto wallets."
  },

  // --- SYSTEM CONTROL ---
  maintenance_mode: {
    label: "Maintenance Mode",
    type: "BOOLEAN",
    group: "system",
    defaultValue: "false",
    description: "If active, non-admins cannot log in."
  },
  maintenance_title: {
    label: "Maintenance Title",
    type: "TEXT",
    group: "system",
    defaultValue: "System Maintenance",
    description: "Header displayed on the lock screen."
  },
  maintenance_message: {
    label: "Maintenance Message",
    type: "TEXT",
    group: "system",
    defaultValue: "We are currently performing scheduled upgrades. Access is restricted.",
    description: "Main body text explaining the downtime."
  },
  maintenance_duration: {
    label: "Duration Text",
    type: "TEXT",
    group: "system",
    defaultValue: "~30 Minutes",
    description: "Estimated time to completion."
  }
};