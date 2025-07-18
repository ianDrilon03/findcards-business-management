-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name text,
    gender text CHECK (gender IN ('male', 'female', 'others')),
    address text,
    phone text,
    role TEXT NOT NULL CHECK (role IN ('admin', 'developer', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT DEFAULT 'unverified' CHECK (status IN ('unverified', 'verified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_credits (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    credits INTEGER DEFAULT 0
);

CREATE TABLE prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    credit_cost INTEGER NOT NULL DEFAULT 5,
    status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
    claimed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY businesses_read ON businesses
    FOR SELECT
    TO AUTHENTICATED
    USING (true);

CREATE POLICY businesses_create ON businesses
    FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (auth.uid() = user_id);


CREATE POLICY businesses_admin_update ON businesses
    FOR UPDATE
    USING (
      (((SELECT users_1.role
         FROM auth.users users_1
        WHERE (users_1.id = auth.uid())))::text = 'admin'::text) 
    );

CREATE POLICY user_credits_access ON user_credits
    FOR SELECT
    TO AUTHENTICATED
    USING (auth.uid() = user_id);

CREATE POLICY prizes_read ON prizes
    FOR SELECT
    TO AUTHENTICATED
    USING (
      (((SELECT users_1.role
         FROM auth.users users_1
        WHERE (users_1.id = auth.uid())))::text = 'admin'::text) 
    );

CREATE POLICY prizes_insert ON prizes
    FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (
      (((SELECT users_1.role
         FROM auth.users users_1
        WHERE (users_1.id = auth.uid())))::text = 'admin'::text) 
    );

CREATE POLICY prizes_update ON prizes
    FOR UPDATE
    TO AUTHENTICATED
    WITH CHECK (
      (((SELECT public.users.role
         FROM public.users
        WHERE (users.id = auth.uid())))::text = 'admin'::text) 
    );

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT
    USING (
      ((auth.uid() = id) AND (role = 'user'::text))
    );

CREATE POLICY "Users can edit their own profile" ON users
    FOR UPDATE
    USING (
      true
    );

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage users" ON users
    FOR ALL
    USING (
      ((( SELECT users_1.role
        FROM auth.users users_1
        WHERE (users_1.id = auth.uid())))::text = 'admin'::text)
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER update_prizes_updated_at
    BEFORE UPDATE ON prizes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Create function to increment credits
CREATE OR REPLACE FUNCTION increment_user_credits(user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_credits (user_id, credits)
    VALUES (user_id, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET credits = user_credits.credits + 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to claim prize
CREATE OR REPLACE FUNCTION claim_prize(p_user_id UUID, p_prize_id UUID, p_credit_cost INTEGER)
RETURNS VOID AS $$
DECLARE
    user_credits INTEGER;
BEGIN
    -- Check if user has enough credits
    SELECT credits INTO user_credits
    FROM user_credits
    WHERE user_id = p_user_id;

    IF user_credits >= p_credit_cost THEN
        -- Update prize
        UPDATE prizes
        SET available = false,
            claimed_by = p_user_id
        WHERE id = p_prize_id
        AND available = true;

        -- Deduct credits
        UPDATE user_credits
        SET credits = credits - p_credit_cost
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role)
    VALUES (NEW.id, NEW.email, 'user')
    ON CONFLICT (email) DO UPDATE
    SET email = NEW.email;

    INSERT INTO public.user_credits (user_id, credits)
    VALUES (NEW.id, 0);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_prizes_claimed_by ON prizes(claimed_by);
CREATE INDEX idx_businesses_name ON businesses(name);
CREATE INDEX idx_prizes_name ON prizes(name);
