# FinShield AI - Detailed Setup Guide

## 🎯 Pre-Demo Checklist

### 1. Environment Setup
- [ ] Docker Desktop installed and running
- [ ] OpenAI API key obtained (https://platform.openai.com/api-keys)
- [ ] Git repository cloned
- [ ] `.env` file created with API key

### 2. Quick Test (5 minutes)
```bash
# Test backend standalone
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add OPENAI_API_KEY to .env
uvicorn app.main:app --reload

# In another terminal, test API
curl http://localhost:8000/api/health
```

### 3. Full Docker Test (10 minutes)
```bash
# From project root
cp .env.example .env
# Add OPENAI_API_KEY to .env

docker-compose up --build

# Wait for services to start, then test:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000/docs
```

---

## 🐛 Troubleshooting

### Issue: "OPENAI_API_KEY not found"
**Solution:**
```bash
# Ensure .env file exists in project root
cat .env
# Should show: OPENAI_API_KEY=sk-...

# For Docker, rebuild:
docker-compose down
docker-compose up --build
```

### Issue: Port already in use
**Solution:**
```bash
# Check what's using ports 3000 or 8000
lsof -i :3000
lsof -i :8000

# Kill processes or change ports in docker-compose.yml
```

### Issue: Frontend can't connect to backend
**Solution:**
```bash
# Check backend is running
curl http://localhost:8000/api/health

# Check Docker network
docker network inspect finshield-network

# Restart services
docker-compose restart
```

### Issue: Graph not rendering
**Solution:**
- Check browser console for errors
- Ensure sample data is uploaded correctly
- Try different browser (Chrome recommended)
- Clear browser cache

### Issue: LLM explanations failing
**Solution:**
```bash
# Verify API key is valid
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check backend logs
docker-compose logs backend

# Fallback: App will use rule-based explanations if LLM fails
```

---

## 📊 Performance Optimization

### For Large Datasets (10k+ transactions)
```python
# In backend/app/graph_analyzer.py
# Adjust these parameters:

# Limit cycle detection depth
cycles = list(nx.simple_cycles(self.graph.to_directed(), length_bound=5))

# Sample large graphs
if len(self.graph.nodes()) > 1000:
    # Use sampling or clustering
    pass
```

### Frontend Performance
```javascript
// In GraphVisualization.jsx
// Reduce particle count for large graphs
linkDirectionalParticles={graphData.nodes.length > 100 ? 1 : 2}
```

---

## 🔧 Development Tips

### Hot Reload Setup
```bash
# Backend auto-reloads on code changes
cd backend
uvicorn app.main:app --reload

# Frontend auto-reloads
cd frontend
npm run dev
```

### API Testing with Postman
1. Import collection from `/docs/postman_collection.json`
2. Set environment variable: `API_URL=http://localhost:8000`
3. Test endpoints: analyze, explain, results

### Database Inspection
```bash
# If using SQLite (future enhancement)
sqlite3 backend/fraud_detection.db
.tables
.schema
```

---

## 🎨 Customization Guide

### Change Color Scheme
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  'accent-blue': '#3b82f6',    // Primary accent
  'accent-purple': '#8b5cf6',  // Secondary accent
  'risk-high': '#ef4444',      // High risk color
  // ... customize as needed
}
```

### Adjust Risk Scoring
Edit `backend/app/graph_analyzer.py`:
```python
def _calculate_risk_scores(self):
    # Modify weights:
    if signal['type'] == 'shared_device':
        score += 3.0  # Increase/decrease weight
    # ...
```

### Add New Fraud Signals
```python
# In graph_analyzer.py, add new detection method:
def _detect_velocity_abuse(self):
    """Detect rapid transaction velocity."""
    # Your logic here
    pass

# Call in build_graph():
self._detect_velocity_abuse()
```

---

## 📦 Deployment

### Production Checklist
- [ ] Change CORS origins in `backend/app/main.py`
- [ ] Use PostgreSQL instead of in-memory storage
- [ ] Enable HTTPS with SSL certificates
- [ ] Set up environment variables securely
- [ ] Configure logging and monitoring
- [ ] Add rate limiting
- [ ] Enable authentication

### Deploy to Cloud

#### AWS (EC2 + RDS)
```bash
# Install Docker on EC2
sudo yum update -y
sudo yum install docker -y
sudo service docker start

# Clone and run
git clone <repo>
cd FinshieldAI
docker-compose up -d
```

#### Heroku
```bash
# Install Heroku CLI
heroku create finshield-ai
heroku config:set OPENAI_API_KEY=sk-...
git push heroku main
```

#### DigitalOcean App Platform
```yaml
# app.yaml
name: finshield-ai
services:
  - name: backend
    dockerfile_path: backend/Dockerfile
    envs:
      - key: OPENAI_API_KEY
        scope: RUN_TIME
        value: ${OPENAI_API_KEY}
  - name: frontend
    dockerfile_path: frontend/Dockerfile
```

---

## 🧪 Testing Strategy

### Unit Tests
```bash
# Backend
cd backend
pytest tests/test_graph_analyzer.py -v

# Frontend
cd frontend
npm test
```

### Integration Tests
```bash
# Test full workflow
curl -X POST http://localhost:8000/api/analyze \
  -F "users_file=@data/users.csv" \
  -F "transactions_file=@data/transactions.csv"
```

### Load Testing
```bash
# Install Apache Bench
brew install httpd

# Test API performance
ab -n 1000 -c 10 http://localhost:8000/api/health
```

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [NetworkX Tutorial](https://networkx.org/documentation/stable/tutorial.html)
- [React Force Graph](https://github.com/vasturiano/react-force-graph)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

---

## 🎓 Learning Path

### For Backend Developers
1. Study NetworkX graph algorithms
2. Learn FastAPI async patterns
3. Understand fraud detection patterns (AML/KYC)
4. Explore LLM prompt engineering

### For Frontend Developers
1. Master React hooks (useState, useEffect, useRef)
2. Learn D3.js/force-graph fundamentals
3. Practice TailwindCSS utility classes
4. Study data visualization best practices

### For Full-Stack
1. Understand REST API design
2. Learn Docker containerization
3. Practice CI/CD workflows
4. Study security best practices

---

**Questions? Open an issue or contact the team!**
