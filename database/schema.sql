-- ============================================================================
-- AI Customer Support Platform - Database Schema
-- Supabase PostgreSQL Schema with Vector Support
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- Profiles Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'agent', 'manager')) DEFAULT 'agent',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================================================
-- Conversations Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'escalated')) DEFAULT 'open',
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    harassment_detected BOOLEAN DEFAULT FALSE,
    harassment_score NUMERIC(3, 2) CHECK (harassment_score >= 0 AND harassment_score <= 1),
    sentiment_score NUMERIC(3, 2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_conversations_agent ON conversations(agent_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_harassment ON conversations(harassment_detected) WHERE harassment_detected = TRUE;

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Agents can view all conversations"
    ON conversations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('agent', 'manager', 'admin')
        )
    );

-- ============================================================================
// Messages Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent', 'ai')),
    content TEXT NOT NULL,
    metadata JSONB,
    harassment_flags TEXT[],
    emotion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_type);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

// Policies
CREATE POLICY "Agents can view messages"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM conversations c
            JOIN profiles p ON p.id = auth.uid()
            WHERE c.id = messages.conversation_id
            AND p.role IN ('agent', 'manager', 'admin')
        )
    );

-- ============================================================================
-- FAQ Documents Table (with Vector Embeddings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS faq_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    embedding VECTOR(1536),  -- OpenAI ada-002 embedding dimension
    usage_count INTEGER DEFAULT 0,
    helpfulness_score NUMERIC(3, 2) DEFAULT 0 CHECK (helpfulness_score >= 0 AND helpfulness_score <= 10),
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Vector similarity search index
CREATE INDEX idx_faq_embedding ON faq_documents USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Other indexes
CREATE INDEX idx_faq_category ON faq_documents(category);
CREATE INDEX idx_faq_active ON faq_documents(is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE faq_documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active FAQ"
    ON faq_documents FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Admins can manage FAQ"
    ON faq_documents FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ============================================================================
-- Harassment Patterns Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS harassment_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    category TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    detection_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_harassment_severity ON harassment_patterns(severity);
CREATE INDEX idx_harassment_active ON harassment_patterns(is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE harassment_patterns ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Agents can view patterns"
    ON harassment_patterns FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('agent', 'manager', 'admin')
        )
    );

-- ============================================================================
-- Analytics Events Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own events"
    ON analytics_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Functions
-- ============================================================================

-- Vector similarity search function for FAQ
CREATE OR REPLACE FUNCTION match_faq_documents(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    category TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        faq_documents.id,
        faq_documents.title,
        faq_documents.content,
        faq_documents.category,
        1 - (faq_documents.embedding <=> query_embedding) AS similarity
    FROM faq_documents
    WHERE
        faq_documents.is_active = TRUE
        AND 1 - (faq_documents.embedding <=> query_embedding) > match_threshold
    ORDER BY faq_documents.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faq_updated_at
    BEFORE UPDATE ON faq_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_harassment_patterns_updated_at
    BEFORE UPDATE ON harassment_patterns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Seed Data (Optional)
-- ============================================================================

-- Insert sample harassment patterns
INSERT INTO harassment_patterns (pattern, severity, category, description) VALUES
    ('生命に関する脅迫', 'critical', '暴力的脅迫', '殺害や暴力を示唆する表現'),
    ('人格否定', 'high', '侮辱', '相手の人格や能力を否定する表現'),
    ('法的措置の示唆', 'high', '威圧', '訴訟や法的手段を仄めかす表現'),
    ('威圧的な要求', 'medium', '強要', '高圧的な態度での要求'),
    ('過度な不満表明', 'low', '不満', '感情的な不満の表現')
ON CONFLICT DO NOTHING;

-- Insert sample FAQ (without embeddings - these should be generated via API)
INSERT INTO faq_documents (title, content, category, tags, is_active) VALUES
    (
        '返品ポリシーについて',
        '商品到着後30日以内であれば、未使用・未開封の商品に限り返品を承ります。返品時の送料はお客様負担となります。',
        '返品・交換',
        ARRAY['返品', 'ポリシー', '期限'],
        TRUE
    ),
    (
        '配送にかかる日数',
        'ご注文確定後、通常3〜5営業日でお届けします。離島など一部地域では追加で2〜3日かかる場合があります。',
        '配送',
        ARRAY['配送', '日数', '期間'],
        TRUE
    ),
    (
        'アカウントのパスワードをリセットする方法',
        'ログイン画面の「パスワードを忘れた場合」をクリックし、登録メールアドレスを入力してください。パスワードリセット用のリンクが送信されます。',
        'アカウント',
        ARRAY['パスワード', 'リセット', 'ログイン'],
        TRUE
    )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Views (Optional)
-- ============================================================================

-- Conversation summary view
CREATE OR REPLACE VIEW conversation_summaries AS
SELECT
    c.id,
    c.customer_name,
    c.customer_email,
    c.status,
    c.priority,
    c.harassment_detected,
    c.harassment_score,
    c.sentiment_score,
    c.category,
    p.full_name AS agent_name,
    p.email AS agent_email,
    COUNT(m.id) AS message_count,
    MAX(m.created_at) AS last_message_at,
    c.created_at,
    c.updated_at
FROM conversations c
LEFT JOIN profiles p ON c.agent_id = p.id
LEFT JOIN messages m ON c.id = m.conversation_id
GROUP BY c.id, p.id;

-- ============================================================================
-- Grants (if needed)
-- ============================================================================

-- Grant appropriate permissions
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
