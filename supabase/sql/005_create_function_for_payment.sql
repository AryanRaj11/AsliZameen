CREATE OR REPLACE FUNCTION unlock_property(target_property_id UUID, requestor_id UUID)
RETURNS JSON AS $$
DECLARE
    current_credits INTEGER;
    already_unlocked BOOLEAN;
    prop_title TEXT;
BEGIN
    -- 1. Check if already unlocked
    SELECT EXISTS (
        SELECT 1 FROM property_unlocks 
        WHERE user_id = requestor_id AND property_id = target_property_id
    ) INTO already_unlocked;

    IF already_unlocked THEN
        RETURN json_build_object('success', true, 'message', 'Already unlocked');
    END IF;

    -- 2. Check credit balance
    SELECT credits INTO current_credits FROM users WHERE id = requestor_id;

    IF current_credits IS NULL OR current_credits < 1 THEN
        RETURN json_build_object('success', false, 'message', 'Insufficient credits');
    END IF;

    -- 3. Get Property Title for the receipt
    SELECT title INTO prop_title FROM properties WHERE id = target_property_id;

    -- 4. START TRANSACTION
    -- Deduct Credit
    UPDATE users SET credits = credits - 1 WHERE id = requestor_id;
    
    -- Record the "Key"
    INSERT INTO property_unlocks (user_id, property_id) 
    VALUES (requestor_id, target_property_id);
    
    -- Record the "Receipt" in Transactions
    INSERT INTO credit_transactions (user_id, amount, transaction_type, description)
    VALUES (requestor_id, -1, 'unlock', 'Unlocked: ' || COALESCE(prop_title, 'Property Details'));

    RETURN json_build_object(
        'success', true, 
        'remaining_credits', current_credits - 1,
        'message', 'Property details unlocked successfully'
    );
END;
$$ LANGUAGE plpgsql;