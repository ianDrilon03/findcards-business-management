-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name text,
    gender text CHECK (gender IN ('male', 'female', 'others')),
    address text,
    phone text,
    avatar text,
    role TEXT NOT NULL CHECK (role IN ('admin', 'developer', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TABLE category(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    website TEXT NOT NULL,
    region TEXT NOT NULL,
    abn_acn TEXT NOT NULL,
    social_media TEXT NOT NULL,
    image TEXT,
    status TEXT DEFAULT 'unverified' CHECK (status IN ('unverified', 'verified')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TABLE business_personal_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  referred_by UUID REFERENCES users(id),
  category_id UUID REFERENCES category(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  personal_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TABLE user_credits (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    credits INTEGER DEFAULT 0
);

CREATE TABLE prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    credit_cost INTEGER NOT NULL DEFAULT 5,
    image TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
    claimed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

 INSERT INTO storage.buckets (id, name, public, file_size_limit)
        VALUES ('business', 'business', TRUE, 5242880); -- 5MB limit

 INSERT INTO storage.buckets (id, name, public, file_size_limit)
        VALUES ('prizes', 'prizes', TRUE, 5242880); -- 5MB limit
    
 INSERT INTO storage.buckets (id, name, public, file_size_limit)
        VALUES ('avatars', 'avatars', TRUE, 5242880); -- 5MB limit

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_personal_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE category ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Upload Select business" ON storage.objects FOR SELECT TO public USING (bucket_id = 'business');
CREATE POLICY "Upload Insert business" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'business');
CREATE POLICY "Upload Update business" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'business');
CREATE POLICY "Upload Delete business" ON storage.objects FOR DELETE TO public USING (bucket_id = 'business');

CREATE POLICY "Upload Select prizes" ON storage.objects FOR SELECT TO public USING (bucket_id = 'prizes');
CREATE POLICY "Upload Insert prizes" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'prizes');
CREATE POLICY "Upload Update prizes" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'prizes');
CREATE POLICY "Upload Delete prizes" ON storage.objects FOR DELETE TO public USING (bucket_id = 'prizes');

CREATE POLICY "Upload Select avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY "Upload Insert avatars" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Upload Update avatars" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'avatars');
CREATE POLICY "Upload Delete avatars" ON storage.objects FOR DELETE TO public USING (bucket_id = 'avatars');

CREATE POLICY category_read_all ON category 
  FOR ALL
  TO AUTHENTICATED
  USING(
    ((( SELECT users_1.role
     FROM users users_1
    WHERE (users_1.id = auth.uid())) = 'admin'::text))
  );

CREATE POLICY category_read ON category
  FOR SELECT
  TO AUTHENTICATED
  USING(archived_at IS NULL);


CREATE POLICY category_write ON category
  FOR INSERT
  WITH CHECK (
     (( SELECT users_1.role
       FROM users users_1
      WHERE (users_1.id = auth.uid())) = 'admin'::text)
  );

CREATE POLICY category_update ON category
  FOR UPDATE
  USING(
    (( SELECT users_1.role
     FROM users users_1
    WHERE (users_1.id = auth.uid())) = 'admin'::text)
  );

CREATE POLICY business_personal_details_read_all ON business_personal_details
  FOR ALL
  USING (true);


CREATE POLICY business_personal_details_read ON business_personal_details
  FOR SELECT
  USING (
    auth.uid() = referred_by AND
    EXISTS (
      SELECT 1
      FROM businesses
      WHERE businesses.id = business_personal_details.business_id
    ) AND archived_at IS NULL
  );


CREATE POLICY business_personal_details_write ON business_personal_details
  FOR INSERT
  TO AUTHENTICATED
  WITH CHECK (auth.uid() = referred_by);

CREATE POLICY business_personal_details_edit ON business_personal_details
  FOR UPDATE
  TO AUTHENTICATED
  USING(
    ((( SELECT users_1.role
     FROM users users_1
    WHERE (users_1.id = auth.uid())) = 'admin'::text) AND (archived_at IS NULL))
  );


CREATE POLICY businesses_read_all ON businesses
    FOR ALL
    TO AUTHENTICATED
    USING (
        (( SELECT users_1.role
         FROM users users_1
        WHERE (users_1.id = auth.uid())) = 'admin'::text)
      ) WITH CHECK(
        (( SELECT users_1.role
         FROM users users_1
        WHERE (users_1.id = auth.uid())) = 'admin'::text)
    );

CREATE POLICY businesses_read ON businesses
    FOR SELECT
    TO AUTHENTICATED
    USING (true);

CREATE POLICY businesses_create ON businesses
    FOR INSERT
    TO AUTHENTICATED
    WITH CHECK (true);

CREATE POLICY businesses_admin_update ON businesses
    FOR UPDATE
    USING (
      (((SELECT users_1.role
         FROM public.users users_1
        WHERE (users_1.id = auth.uid())))::text = 'admin'::text) 
    );

CREATE POLICY businesses_delete ON businesses 
  FOR DELETE
  TO AUTHENTICATED
  USING (true);

CREATE POLICY user_credits_access ON user_credits
    FOR SELECT
    TO AUTHENTICATED
    USING (auth.uid() = user_id);

CREATE POLICY user_credits_admin_access ON user_credits
    FOR ALL
    TO AUTHENTICATED
    USING(
      ((( SELECT users_1.role
         FROM users users_1
        WHERE (users_1.id = auth.uid())) = 'admin'::text) OR (auth.uid() = user_id))
    );


CREATE POLICY prizes_read_all ON prizes
  FOR ALL
  TO AUTHENTICATED
  USING(true);

CREATE POLICY prizes_read ON prizes
    FOR SELECT
    TO AUTHENTICATED
    USING (
      archived_at IS NULL
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


CREATE TRIGGER update_businesses_details_updated_at
    BEFORE UPDATE ON business_personal_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

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
CREATE OR REPLACE FUNCTION increment_user_credits(id UUID)
RETURNS VOID AS $$
BEGIN
 UPDATE user_credits SET credits = user_credits.credits + 1 WHERE user_credits.user_id = id;
END;
$$ LANGUAGE plpgsql;

-- Create function to decrement credits
CREATE OR REPLACE FUNCTION decrement_user_credits(id UUID)
RETURNS VOID AS $$
BEGIN
 UPDATE user_credits SET credits = user_credits.credits - 1 WHERE user_credits.user_id = id;
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

CREATE INDEX idx_businesses_details_reffered_by ON business_personal_details(referred_by);
CREATE INDEX idx_prizes_claimed_by ON prizes(claimed_by);
CREATE INDEX idx_businesses_name ON businesses(name);
CREATE INDEX idx_prizes_name ON prizes(name);
