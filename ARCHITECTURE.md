# 🏗️ Architecture Documentation

## System Overview

The AI Customer Support Platform is built using a modern, microservices-inspired architecture with clear separation between frontend, backend, and data layers.

## Architecture Principles

1. **Separation of Concerns**: Clear boundaries between UI, business logic, and data
2. **Scalability**: Horizontal scaling capabilities for each component
3. **Security First**: Multiple layers of security (auth, RLS, validation)
4. **Performance**: Optimized for sub-second response times
5. **Observability**: Comprehensive logging, monitoring, and alerting

---

## Component Architecture

### Frontend (Next.js)

```
app/
├── (auth)/              # Authentication flow
│   ├── login/          # Login page
│   └── signup/         # Signup page
├── (dashboard)/         # Main application
│   ├── conversations/  # Conversation list
│   ├── chat/           # Chat interface
│   ├── analytics/      # Dashboard & metrics
│   └── admin/          # Admin panel
└── api/                # API routes (proxies to backend)
```

**Key Features:**
- Server-Side Rendering (SSR) for initial load
- Client-side navigation for instant transitions
- Real-time updates via Supabase Realtime
- Optimistic UI updates for better UX

### Backend (FastAPI)

```
backend/app/
├── api/                # API endpoints
│   ├── chat.py        # Chat & RAG endpoints
│   ├── harassment.py  # Harassment detection
│   ├── analytics.py   # Analytics & metrics
│   └── conversations.py
├── services/          # Business logic
│   ├── rag_service.py
│   ├── harassment_detection.py
│   └── analytics_service.py
├── models/            # Pydantic models
└── config.py          # Configuration
```

**Key Features:**
- RESTful API design
- Async/await for high concurrency
- Pydantic validation
- Automatic API documentation (Swagger/ReDoc)

### Database (Supabase/PostgreSQL)

```sql
Key Tables:
- profiles             # User accounts & roles
- conversations        # Customer conversations
- messages             # Individual messages
- faq_documents        # Knowledge base (with vectors)
- harassment_patterns  # Detection patterns
- analytics_events     # Event tracking
```

**Key Features:**
- Row Level Security (RLS)
- Vector search with pgvector
- Real-time subscriptions
- Automatic timestamping

---

## Data Flow Diagrams

### 1. User Authentication Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ 1. Login Request (email/password)
     ▼
┌──────────────────┐
│ Next.js API Route│
└────┬─────────────┘
     │ 2. Forward to Supabase Auth
     ▼
┌──────────────────┐
│  Supabase Auth   │
└────┬─────────────┘
     │ 3. Validate & Generate JWT
     ▼
┌──────────────────┐
│   PostgreSQL     │ 4. Create session
└────┬─────────────┘
     │ 5. Return JWT + Refresh Token
     ▼
┌──────────┐
│  Client  │ 6. Store tokens (httpOnly cookie)
└──────────┘
```

### 2. AI Chat with RAG Flow

```
User sends message
     │
     ▼
┌──────────────────────┐
│ 1. Frontend validates │
│    & shows optimistic │
│    UI update          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 2. POST /api/chat    │
│    /completions      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 3. Generate query    │
│    embedding         │
│    (OpenAI API)      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 4. Vector search in  │
│    Supabase          │
│    (pgvector)        │
└──────┬───────────────┘
       │ Top 3 FAQs retrieved
       ▼
┌──────────────────────┐
│ 5. Build context     │
│    - FAQs            │
│    - History         │
│    - Customer data   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 6. Call GPT-4 with   │
│    structured prompt │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 7. Store message &   │
│    response in DB    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ 8. Return to client  │
│    with sources &    │
│    confidence        │
└──────────────────────┘
```

### 3. Harassment Detection Flow

```
Message received
     │
     ▼
┌──────────────────────────┐
│ 1. Keyword Scanner       │
│    (Instant, < 10ms)     │
└──────┬───────────────────┘
       │
       ├─ Critical? ──> Immediate escalation
       │
       ▼ No
┌──────────────────────────┐
│ 2. Load conversation     │
│    context from DB       │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ 3. AI Analysis           │
│    (GPT-4, ~400ms)       │
│    - Context aware       │
│    - Pattern matching    │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ 4. Calculate score       │
│    & severity            │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ 5. Store detection       │
│    result in DB          │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ 6. Trigger alerts        │
│    (if necessary)        │
│    - WebSocket           │
│    - Email               │
│    - Dashboard           │
└──────────────────────────┘
```

---

## Security Architecture

### Defense in Depth

```
Layer 1: Network Security
- HTTPS/TLS encryption
- CORS policies
- Rate limiting

Layer 2: Application Security
- JWT authentication
- API key validation
- Input sanitization
- XSS protection

Layer 3: Database Security
- Row Level Security (RLS)
- Parameterized queries
- Encryption at rest
- Audit logging

Layer 4: Monitoring & Response
- Real-time threat detection
- Automated alerts
- Incident response procedures
```

### Authentication & Authorization

```
┌────────────────────────────────────────┐
│           Request Flow                  │
└────────────────────────────────────────┘
                 │
                 ▼
         ┌──────────────┐
         │ JWT Token?   │
         └──────┬───────┘
                │ Yes
                ▼
         ┌──────────────┐
         │ Valid Token? │
         └──────┬───────┘
                │ Yes
                ▼
         ┌──────────────┐
         │ Check Role   │
         │ (RLS Policy) │
         └──────┬───────┘
                │ Authorized
                ▼
         ┌──────────────┐
         │ Execute      │
         │ Request      │
         └──────────────┘
```

---

## Scalability Strategy

### Horizontal Scaling

| Component | Scaling Strategy | Current Capacity |
|-----------|------------------|------------------|
| **Frontend** | Vercel Edge Functions | Auto-scales, ~10M requests/month |
| **Backend API** | Railway/Kubernetes pods | 4-32 instances |
| **Database** | Read replicas | 1 primary + 2 replicas |
| **Vector Search** | Supabase/Pinecone | Auto-scaling |

### Performance Optimizations

1. **Caching Strategy**
   ```
   - Browser cache: 1 year for static assets
   - CDN cache: 1 hour for SSR pages
   - API cache: 5 minutes for analytics
   - Vector embeddings: Permanent cache
   ```

2. **Database Optimization**
   ```sql
   -- Indexes for common queries
   CREATE INDEX idx_conversations_status ON conversations(status);
   CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
   
   -- Vector index for fast similarity search
   CREATE INDEX idx_faq_embedding ON faq_documents 
   USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
   ```

3. **Connection Pooling**
   ```python
   # Supabase connection pool
   max_connections = 20
   min_connections = 5
   ```

---

## Monitoring & Observability

### Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API Response Time (P95) | < 500ms | > 1000ms |
| Error Rate | < 0.1% | > 1% |
| Database Query Time | < 100ms | > 500ms |
| Harassment Detection Accuracy | > 95% | < 90% |
| Uptime | 99.9% | < 99% |

### Logging Strategy

```
Frontend:
- Console errors → Sentry
- User actions → Analytics
- Performance → Vercel Analytics

Backend:
- Request/Response → Structured logs
- Errors → Sentry
- Security events → Audit log

Database:
- Slow queries → Alert
- Failed auth → Security log
- RLS violations → Audit log
```

---

## Disaster Recovery

### Backup Strategy

- **Database**: Automated daily backups, 30-day retention
- **Object Storage**: Geo-replicated across 3 regions
- **Code**: GitHub with branch protection
- **Configuration**: Encrypted in secret manager

### Recovery Time Objectives (RTO)

| Component | RTO | RPO |
|-----------|-----|-----|
| Frontend | 5 min | 0 (stateless) |
| Backend API | 10 min | 1 hour |
| Database | 30 min | 5 min |
| Overall System | 30 min | 1 hour |

---

## Technology Choices & Rationale

### Why Next.js?

- ✅ SSR/SSG for optimal SEO
- ✅ Built-in API routes
- ✅ Excellent TypeScript support
- ✅ Vercel deployment integration
- ✅ Large ecosystem

### Why FastAPI?

- ✅ Async/await for high performance
- ✅ Automatic API documentation
- ✅ Type safety with Pydantic
- ✅ Easy integration with Python AI libraries
- ✅ Growing community

### Why Supabase?

- ✅ PostgreSQL with built-in auth
- ✅ Real-time capabilities
- ✅ Row Level Security
- ✅ Vector search support (pgvector)
- ✅ Generous free tier

### Why OpenAI GPT-4?

- ✅ Best-in-class language understanding
- ✅ Reliable API
- ✅ Good documentation
- ✅ Supports streaming responses
- ✅ Function calling capabilities

---

## Future Enhancements

### Phase 2 (Q3 2026)

- [ ] Multi-language support
- [ ] Voice integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Custom ML models

### Phase 3 (Q4 2026)

- [ ] Federated learning for privacy
- [ ] Blockchain-based audit trail
- [ ] AI agent orchestration
- [ ] Self-service knowledge base updates
- [ ] Enterprise SSO integration

---

## Conclusion

This architecture balances:
- **Developer Experience**: Modern tools, clear patterns
- **User Experience**: Fast, reliable, intuitive
- **Business Value**: Scalable, secure, cost-effective
- **Future-Proofing**: Extensible, maintainable

The system is designed to handle **10,000+ concurrent users** and **1M+ conversations/month** while maintaining sub-second response times and 99.9% uptime.
