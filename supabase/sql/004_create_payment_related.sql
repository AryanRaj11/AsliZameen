-- ALTER TABLE users 
-- ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 2;

--Optional: Ensure credits never go below zero
ALTER TABLE users 
ADD CONSTRAINT check_positive_credits CHECK (credits >= 0);

--This table acts as the "Permission Ledger." It records which user has paid for which property.
CREATE TABLE IF NOT EXISTS property_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT now(),
    
    -- This prevents a user from "unlocking" the same property twice
    UNIQUE(user_id, property_id)
);

-- Indexing for lightning-fast lookups when a user opens a property page
CREATE INDEX IF NOT EXISTS idx_unlocks_user_property ON property_unlocks(user_id, property_id);

--This table records every "In" and "Out" of credits. It’s your audit trail for asliZameen.
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Positive for purchases, negative for usage
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('signup_bonus', 'purchase', 'unlock', 'referral')),
    description TEXT, -- e.g., "Unlocked Property: Bihta 5 Kattha"
    metadata JSONB,   -- To store Razorpay Payment IDs: { "razorpay_order_id": "order_987" }
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast history lookup
CREATE INDEX IF NOT EXISTS idx_transactions_user ON credit_transactions(user_id);