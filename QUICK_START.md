# R2 Ditu Quick Start Guide
## AI-Powered Collaborative Whiteboard for Legal Case Preparation

🚨 **URGENT**: Ready for landlord-tenant hearing preparation (June 27th deadline)

## 🚀 Quick Setup (5 minutes)

### 1. Start the AI Backend
```bash
cd ai-backend
npm install
OPENAI_API_KEY="your-key-here" npm start
```
**Backend will run on**: http://localhost:3015

### 2. Start the Frontend
```bash
cd excalidraw-app
yarn install
BROWSER=none yarn start --host 0.0.0.0 --port 12000
```
**Frontend will run on**: http://localhost:12000

### 3. Access R2 Ditu
Open your browser to: **http://localhost:12000**

## 🎯 For Landlord-Tenant Hearing Prep

### Step 1: Open AI Assistant
1. Click the **hamburger menu** (☰) in the top-left
2. Select **"AI Assistant"** (magic wand icon)
3. The AI chat panel will appear on the right

### Step 2: Start Case Organization
Type in the AI chat:
```
Help me organize a landlord-tenant case. I need to prepare for a hearing on June 27th.
```

### Step 3: Follow AI Guidance
The AI will provide:
- **Case organization structure**
- **Evidence collection checklist**
- **Timeline creation guidance**
- **Legal argument framework**
- **Hearing preparation steps**

### Step 4: Use the Whiteboard
- Create sections for: Facts, Evidence, Legal Arguments, Questions
- Use different colors for different information types
- Add text boxes for key points
- Draw connections between related items
- Upload documents and images as needed

## 🔧 Features Available Now

### ✅ Working Features
- **AI Chat Interface**: Real-time conversation with legal expertise
- **Whiteboard Context**: AI understands what's on your board
- **Legal Templates**: Specialized prompts for case preparation
- **Collaborative Tools**: All standard whiteboard features
- **Export Options**: Save your work in multiple formats

### 🔄 In Development
- **Visual Element Generation**: AI creates whiteboard elements
- **Document Analysis**: AI reads uploaded legal documents
- **Case Templates**: Pre-built layouts for common legal scenarios
- **MCP Integration**: Direct connection to Claude/ChatGPT

## 📋 Landlord-Tenant Hearing Checklist

Use R2 Ditu to organize:

### Before the Hearing
- [ ] Timeline of all incidents
- [ ] Photos of property conditions
- [ ] All written communications
- [ ] Rent payment records
- [ ] Witness contact information
- [ ] Relevant housing law citations
- [ ] Prepared statement of facts

### During the Hearing
- [ ] Clear presentation of evidence
- [ ] Organized document references
- [ ] Key points to emphasize
- [ ] Questions for opposing party
- [ ] Legal arguments summary

### AI Assistant Prompts to Try
```
"Create a timeline for my landlord-tenant dispute"
"Help me organize evidence for property damage claims"
"What legal arguments should I prepare for non-payment of rent?"
"Review my case facts and suggest improvements"
"Create a checklist for my hearing preparation"
```

## 🛠️ Troubleshooting

### Frontend Issues
- **Build errors**: Check TypeScript/ESLint warnings (non-blocking)
- **Port conflicts**: Change port in start command
- **Dependencies**: Run `yarn install` in excalidraw-app/

### Backend Issues
- **AI not responding**: Check backend logs, uses mock responses if OpenAI fails
- **CORS errors**: Backend has CORS enabled for all origins
- **Port 3015 busy**: Change PORT in ai-backend/.env

### AI Integration
- **No OpenAI key**: Uses intelligent mock responses
- **API errors**: Automatic fallback to mock responses
- **Context issues**: AI receives whiteboard state with each request

## 📞 Support

- **GitHub Issues**: https://github.com/rebots-online/r2-ditu/issues
- **Documentation**: `/dev-docs/docs/r2-ditu-docs/`
- **Status Updates**: `/dev-docs/docs/r2-ditu-docs/current-status.md`

## 🎯 Success Criteria

By June 27th, you should be able to:
- [x] Load R2 Ditu whiteboard without errors
- [x] Chat with AI assistant about your case
- [x] Organize case information visually
- [x] Export your preparation materials
- [ ] Present organized case at hearing

---

**Last Updated**: June 25, 2025
**Status**: Ready for immediate use
**Priority**: URGENT - Hearing in 2 days