# Visor AI Overlay

Visor is a **desktop AI overlay assistant** that allows users to capture any region of their screen and instantly ask an AI questions about it.

Instead of switching tabs, copying screenshots, or opening separate AI tools, Visor works **directly on top of any application** and provides contextual AI explanations in floating chat windows.

The system is designed for **learning, debugging, research, and quick understanding of visual content** such as:

* diagrams
* code
* documents
* presentations
* websites
* images
* PDFs

Visor uses a lightweight **overlay interface** that appears with a keyboard shortcut and allows users to capture screen content and interact with an AI assistant.

---

# Key Features

### Global AI Overlay

A floating AI toolbar that can be opened from anywhere on the desktop.

### Screen Context AI

Capture part of your screen and ask the AI questions about the captured content.

### Persistent Chat Sessions

Conversations are saved and can be reopened later from the chat hub.

### Multi-Window Chat System

Each capture opens its own chat window so multiple topics can be explored simultaneously.

### Minimize and Restore Chats

Chat windows can be minimized and restored without losing conversation context.

---

# How to Use Visor

## 1. Toggle the Overlay

Press:

```
Alt + Space
```

This will toggle the **Visor activation bar** at the top of the screen.

The activation bar provides quick access to Visor's core tools.

---

## 2. Open a Text Chat

Click:

```
Extract Text
```

This opens a **new AI chat window** without attaching any screen context.

Use this mode when you want to:

* ask general questions
* brainstorm ideas
* explain concepts
* continue a previous discussion

Each chat opens in its own floating window.

---

## 3. Capture a Screen Region

Click:

```
Capture Screen
```

Your cursor will enter **selection mode**.

Steps:

1. Click and drag to select a region of the screen
2. Release the mouse to capture the region
3. A new chat window will open with the captured image attached

You can now ask questions about the captured content.

Examples:

* “Explain this diagram”
* “What does this error mean?”
* “Summarize this paragraph”
* “How does this algorithm work?”

---

## 4. View Past Conversations

Click:

```
Chat Hub
```

This opens the **Visor Hub Window**, which displays previously saved conversations.

From the hub you can:

* browse past chats
* reopen previous conversations
* continue asking questions in earlier sessions

This turns Visor into a **persistent AI workspace rather than a temporary assistant.**

---

# Chat Window Controls

Each chat opens in a floating window that can be moved and controlled independently.

## Dragging Windows

You can drag a chat window by holding the **title bar** and moving it anywhere on the screen.

This allows you to keep the chat near the content you are working with.

---

## Minimizing a Chat

Click the **minimize button (−)** in the chat window header.

The window will hide and the session will remain active.

This allows you to temporarily remove the chat from view without closing it.

---

## Restoring a Chat

Minimized chats can be restored using the **chat bubble system**.

Click the bubble to restore the full chat window.

This makes it easy to keep multiple chats available while working.

---

# Example Workflow

A typical workflow using Visor:

1. Press **Alt + Space**
2. Click **Capture Screen**
3. Select a diagram on the screen
4. Ask the AI to explain it
5. Minimize the chat
6. Capture another section
7. Open a second chat
8. Restore previous chats when needed

This enables **parallel learning and exploration** across multiple topics.

---

# Architecture Overview

Visor consists of three main layers.

### Desktop Overlay Application

Built using:

* **Tauri**
* **Rust**
* **React**

Responsible for:

* overlay UI
* screen capture
* chat window management

---

### Backend API

The backend is implemented using serverless AWS services.

Components include:

* API Gateway
* AWS Lambda
* DynamoDB

This backend manages:

* chat sessions
* message storage
* conversation history

---

### AI Processing

AI responses are generated using the **Gemini AI model**.

The system supports:

* text reasoning
* image understanding
* contextual conversations

---

# Limitations

### AI Free Tier Restrictions

Visor currently runs on free-tier cloud services.

Because of this:

* AI responses may occasionally be slower
* AI usage may be temporarily limited if quota limits are reached
* some requests may fail if free-tier usage is exhausted

These limits are expected in a development or demonstration environment.

---

# Requirements

To run Visor locally you need:

* Node.js
* Rust
* Tauri CLI

Install dependencies:

```
npm install
```

Run the application:

```
npm run tauri dev
```

Build the application:

```
npm run tauri build
```

---

# Future Improvements

Planned improvements include:

* smarter text extraction
* automatic context detection
* improved chat window management
* local AI model support
* collaborative AI sessions
* better diagram analysis

---

# Project Goal

Visor aims to transform AI assistants from **separate tools** into **contextual overlays that integrate directly into the user's workflow.**

Instead of leaving your work to ask AI questions, the AI comes to you.

---

# License

This project is intended for research and demonstration purposes.
